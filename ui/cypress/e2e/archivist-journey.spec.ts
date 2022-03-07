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

import { join } from 'path';

import { getArchivesPagePathWithTeamId } from '../../src/react/routes/RouteConstants';
import Topic, { ThoughtTopic } from '../../src/react/types/Topic';
import { getTeamCredentials } from '../support/helpers';

describe('Archivist Journey', () => {
  const teamCredentials = getTeamCredentials();

  before(() => {
    cy.createTeamAndLogin(teamCredentials);
  });

  it('Archives page functionality', () => {
    addThoughtToTeam(teamCredentials.teamId, 'message1', 0, false, Topic.HAPPY);
    addThoughtToTeam(teamCredentials.teamId, 'message2', 1, false, Topic.HAPPY);
    addThoughtToTeam(teamCredentials.teamId, 'message3', 2, true, Topic.HAPPY);
    addThoughtToTeam(teamCredentials.teamId, 'message4', 0, false, Topic.UNHAPPY);
    addCompletedActionItemToTeam(teamCredentials.teamId, 'action to take', 'me');
    archiveBoard(teamCredentials.teamId);

    cy.findByText('Archives').click();
    shouldBeOnArchivesPage(teamCredentials.teamId);

    cy.findByText('View').click();
    cy.findByText('message1').should('exist');
    cy.findByText('message2').should('exist');
    cy.findByText('message3').should('exist');
    cy.findByText('message4').should('exist');

    cy.findByText('Thoughts').click();
    shouldBeOnArchivesPage(teamCredentials.teamId);

    cy.findByText('Action Items').click();
    cy.findByText('Action Item Archives').should('exist');
    cy.findByText('action to take').should('exist');
  });

  it('Download CSV Button', () => {
    cy.findByText('Retro').click();
    cy.shouldBeOnRetroPage(teamCredentials.teamId);

    cy.findByText('Download CSV').as('downloadCSVButton').click();

    const downloadsFolder = Cypress.config('downloadsFolder');
    const downloadedFilename = join(downloadsFolder, `${teamCredentials.teamId}-board.csv`);

    cy.readFile(downloadedFilename, 'binary', { timeout: 5000 })
      .should((buffer) => expect(buffer.length).to.be.gt(40))
      .should('eq', 'Column,Message,Likes,Completed,Assigned To\r\n');
  });
});

function shouldBeOnArchivesPage(teamId: string) {
  cy.log('**Should be on Archives page**');

  const archivesPageUrl = Cypress.config().baseUrl + getArchivesPagePathWithTeamId(teamId);
  cy.url().should('eq', archivesPageUrl);

  cy.findByText('Thought Archives').should('exist');
}

function addThoughtToTeam(teamId: String, message: String, hearts: number, discussed: boolean, topic: ThoughtTopic) {
  cy.request({
    url: `/api/team/${teamId}/thought`,
    failOnStatusCode: false,
    method: 'POST',
    body: {
      message,
      hearts,
      discussed,
      topic,
    },
  });
}

function addCompletedActionItemToTeam(teamId: String, task: String, assignee: String) {
  cy.request({
    url: `/api/team/${teamId}/action-item/`,
    method: 'POST',
    body: {
      task,
      completed: true,
      assignee,
      dateCreated: new Date(),
      archived: true,
    },
  });
}

function archiveBoard(teamId: string) {
  cy.request({
    url: `/api/team/${teamId}/end-retro`,
    method: 'PUT',
    body: {},
  });
}
