/*
 * Copyright (c) 2022 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { getArchiveRetroApiPath } from '../../src/react/services/api/ApiConstants';
import Topic from '../../src/react/types/Topic';
import { getTeamCredentials } from '../support/helpers';
import Chainable = Cypress.Chainable;

describe('Retro Facilitator Journey', () => {
  let teamCredentials;

  beforeEach(() => {
    teamCredentials = getTeamCredentials();
    cy.createTeamAndLogin(teamCredentials);
  });

  xit('Rename columns', () => {});

  xit('Sort thoughts', () => {});

  xit('Display thought in expanded mode', () => {});

  xit('Add action item from expanded mode', () => {});

  it('Mark thought as discussed (default and expanded)', () => {
    const happyThought = 'This is a good week';
    cy.enterThought(Topic.HAPPY, happyThought);
    cy.enterThought(Topic.HAPPY, 'Another positive note');
    getHappyColumnItems().last().should('not.have.class', 'completed');

    getRetroItemByMessage(happyThought).find('[data-testid=columnItem-checkboxButton]').as('discussedButton');

    cy.log(`**Mark happy thought "${happyThought}" as discussed**`);
    cy.get(`@discussedButton`).click();

    cy.log('**Thought marked as discussed should move to bottom of the list**');
    getHappyColumnItems().should('have.length', 2).last().should('have.class', 'completed');

    cy.get(`@discussedButton`).click();

    cy.log(`**Unmark happy thought as discussed and move up the list**`);
    getHappyColumnItems().should('have.length', 2).last().should('not.have.class', 'completed');

    // @todo test in expanded view
  });

  it('Action item actions (create, edit, delete, mark as complete)', () => {
    cy.log('**Should have "Action Items" column header in yellow**');
    const yellow = 'rgb(241, 196, 15)';
    cy.findByText('Action Items').should('exist').parent().should('have.css', 'background-color', yellow);

    cy.get('[data-testid=retroColumn__action]').as('actionsColumn');

    let task1 = 'Increase Code Coverage';
    const assignee1 = 'Bob';
    const task2 = 'Make our meetings shorter';
    const actionItemsToInput = [`${task1} @${assignee1}`, `${task2} @Larry`];
    shouldCreateActionItems(actionItemsToInput);

    shouldEditActionItemTaskAndAssignee(task1, 'by 10%', assignee1, ', Larry');

    task1 += ' by 10%';
    shouldMarkAndUnmarkActionItemAsCompleted(task1);

    shouldDeleteActionItem(task2);

    cy.log('**On page reload all Action Items should still be there**');
    cy.reload();
    cy.confirmNumberOfActionItemsInColumn(1);
  });

  it('Archive retro', () => {
    cy.intercept('PUT', getArchiveRetroApiPath(teamCredentials.teamId)).as('putArchiveRetro');
    cy.get('[data-testid=retroColumn__action]').as('actionsColumn');

    cy.enterThought(Topic.UNHAPPY, 'Unhappy Thought');
    const activeActionItemTask = 'Active Action Item';
    const completedActionItemTask = 'Action item we completed';
    cy.enterActionItem(activeActionItemTask);
    cy.enterActionItem(completedActionItemTask);
    cy.log(`**Marking action item task "${completedActionItemTask}" as completed**`);
    cy.getActionItemByTask(completedActionItemTask).find('[data-testid=columnItem-checkboxButton]').click();

    cy.findByText('Archive Retro').as('archiveRetroButton').click();
    cy.get('[data-testid=archiveRetroDialog]').as('modal');

    ensureModalIsOpen();

    cy.get('@modal').findByText('Nope').click();
    ensureModalIsClosed();
    cy.get('@putArchiveRetro').its('response.statusCode').should('eq', null);

    cy.confirmNumberOfThoughtsInColumn(Topic.UNHAPPY, 1);
    cy.confirmNumberOfActionItemsInColumn(2);

    cy.get('@archiveRetroButton').click();
    ensureModalIsOpen();
    cy.get('@modal').findByText('Yes!').click();
    ensureModalIsClosed();
    cy.get('@putArchiveRetro').its('response.statusCode').should('eq', 200);

    cy.findByDisplayValue(activeActionItemTask).should('exist');
    cy.findByDisplayValue(completedActionItemTask).should('not.exist');
    cy.confirmNumberOfThoughtsInColumn(Topic.UNHAPPY, 0);
    cy.confirmNumberOfActionItemsInColumn(1);
  });
});

const ensureModalIsOpen = () => {
  // cy.get('@modal').should('be.visible'); // works for angular instance
  cy.get('@modal').should('exist'); // works for react instance
};

const ensureModalIsClosed = () => {
  // cy.get('@modal').should('not.be.visible'); // works for angular instance
  cy.get('@modal').should('not.exist'); // works for react instance
};

function shouldCreateActionItems(actionItems: string[]) {
  actionItems.forEach((actionString, index) => {
    cy.enterActionItem(actionString);

    cy.confirmNumberOfActionItemsInColumn(index + 1);

    const splitActionString = actionString.split('@');
    const action = splitActionString[0].trim();
    const assignedTo = splitActionString[1];

    cy.findByDisplayValue(action);
    cy.findByDisplayValue(assignedTo);
  });
}

const getHappyColumnItems = () => cy.get('[data-testid=retroColumn__happy]').find(`[data-testid=retroItem]`);

function shouldEditActionItemTaskAndAssignee(
  currentTask: string,
  appendToTask: string,
  currentAssignee: string,
  appendToAssignee: string
) {
  cy.log(`**Edit Action Item: ${currentTask}**`);
  cy.getActionItemByTask(currentTask).as('actionItemToEdit');

  cy.get('@actionItemToEdit').find('[data-testid=columnItem-editButton]').type(`{rightarrow} ${appendToTask}{enter}`);
  cy.get('@actionItemToEdit').findByDisplayValue(`${currentTask} ${appendToTask}`);

  cy.get('@actionItemToEdit').find('[data-testid=actionItem-assignee]').type(`${appendToAssignee}{enter}`);
  cy.get('@actionItemToEdit').findByDisplayValue(`${currentAssignee}${appendToAssignee}`);
}

function shouldMarkAndUnmarkActionItemAsCompleted(actionItemTask: string) {
  getActionColumnItems().last().should('not.have.class', 'completed');

  cy.getActionItemByTask(actionItemTask).find('[data-testid=columnItem-checkboxButton]').as('completedButton');

  cy.log(`**Mark action item task "${actionItemTask}" as completed**`);
  cy.get(`@completedButton`).click();

  cy.log('**Completed action item should move to bottom of the list**');
  getActionColumnItems().should('have.length', 2).last().should('have.class', 'completed');

  cy.get(`@completedButton`).click();

  cy.log('**Unmark action item as completed and move up the list**');
  getActionColumnItems().should('have.length', 2).last().should('not.have.class', 'completed');
}

function shouldDeleteActionItem(actionItemTask: string) {
  cy.log(`**Deleting action item ${actionItemTask}**`);
  cy.getActionItemByTask(actionItemTask).find(`[data-testid=columnItem-deleteButton]`).click();
  cy.get('[data-testid=deletionOverlay]').contains('Yes').click();
}

const getActionColumnItems = () => cy.get('[data-testid=retroColumn__action]').find(`[data-testid=actionItem]`);
const getRetroItemByMessage = (message: string): Chainable =>
  cy.findByDisplayValue(message).closest(`[data-testid=retroItem]`);
