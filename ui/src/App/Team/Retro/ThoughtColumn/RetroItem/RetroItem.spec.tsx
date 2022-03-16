/*
 * Copyright (c) 2021 Ford Motor Company
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

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { RecoilRoot } from 'recoil';

import ThoughtService from '../../../../../Services/Api/ThoughtService';
import { TeamState } from '../../../../../State/TeamState';
import Team from '../../../../../Types/Team';
import Thought from '../../../../../Types/Thought';
import Topic, { ThoughtTopic } from '../../../../../Types/Topic';

import RetroItem from './RetroItem';

jest.mock('../../../../../Services/Api/ThoughtService');

describe('RetroItem', () => {
	const fadeInAnimationClass = 'fade-in';
	const fadeOutAnimationClass = 'fade-out';
	const team: Team = {
		name: 'My Team',
		id: 'my-team',
	};

	const fakeThought: Thought = {
		id: 12,
		message: 'fake message',
		hearts: 3,
		discussed: false,
		topic: Topic.HAPPY,
	};

	it('should render without axe errors', async () => {
		const { container } = render(
			<RecoilRoot>
				<RetroItem thought={fakeThought} type={Topic.HAPPY} />
			</RecoilRoot>
		);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it.each([[Topic.HAPPY], [Topic.CONFUSED], [Topic.UNHAPPY]])(
		'should render %s type',
		(type: Topic) => {
			render(
				<RecoilRoot>
					<RetroItem thought={fakeThought} type={type as ThoughtTopic} />
				</RecoilRoot>
			);

			expect(screen.getByTestId('retroItem').className).toContain(type);
		}
	);

	it('should render thought message and upvotes', () => {
		render(
			<RecoilRoot>
				<RetroItem thought={fakeThought} type={Topic.HAPPY} />
			</RecoilRoot>
		);

		screen.getByText(fakeThought.message);
		screen.getByText(fakeThought.hearts);
		screen.getByText('Upvote');
	});

	it('should disable animations', () => {
		render(
			<RecoilRoot>
				<RetroItem
					thought={fakeThought}
					type={Topic.HAPPY}
					disableAnimations={true}
				/>
			</RecoilRoot>
		);

		const retroItem = screen.getByTestId('retroItem');
		expect(retroItem.className).not.toContain(fadeInAnimationClass);
		expect(retroItem.className).not.toContain(fadeOutAnimationClass);
	});

	describe('When not discussed and not readonly', () => {
		beforeEach(() => {
			render(
				<RecoilRoot
					initializeState={({ set }) => {
						set(TeamState, team);
					}}
				>
					<RetroItem type={Topic.HAPPY} thought={fakeThought} />
				</RecoilRoot>
			);
		});

		it('should open retro item modal', () => {
			clickRetroItem();

			expect(screen.getByTestId('retroItemModal')).toBeDefined();
		});

		it('should upvote thought', () => {
			clickUpvote();

			expect(ThoughtService.upvoteThought).toHaveBeenCalledWith(
				team.id,
				fakeThought.id
			);
		});

		it('should start and cancel editing of thought', () => {
			const newText = 'New Fake Text';

			screen.getByText(fakeThought.message);

			clickEdit();
			screen.getByText(fakeThought.message);

			editText(newText);
			screen.getByText(newText);

			escapeKey();
			screen.getByText(fakeThought.message);

			clickEdit();
			screen.getByText(fakeThought.message);

			editText(newText);
			screen.getByText(newText);

			clickEdit();
			screen.getByText(fakeThought.message);
		});

		it('should disable other buttons while editing', () => {
			clickEdit();
			expect(textReadonly()).toBeFalsy();

			clickUpvote();
			expect(ThoughtService.upvoteThought).not.toHaveBeenCalled();

			clickDelete();
			expect(deleteMessage()).toBeFalsy();

			clickCheckbox();
			expect(ThoughtService.updateDiscussionStatus).not.toHaveBeenCalled();
		});

		it('should edit thought', () => {
			clickEdit();
			const updatedText = 'New Fake Text';
			editText(`${updatedText}{Enter}`);
			expect(ThoughtService.updateMessage).toHaveBeenCalledWith(
				team.id,
				fakeThought.id,
				updatedText
			);
		});

		it('should close delete confirmation overlay if user clicks escape', () => {
			clickDelete();
			expect(deleteMessage()).toBeTruthy();

			escapeKey();
			expect(deleteMessage()).toBeFalsy();
		});

		it('should not delete thought user cancels deletion', () => {
			expect(deleteMessage()).toBeFalsy();
			clickDelete();
			expect(deleteMessage()).toBeTruthy();

			clickCancelDelete();
			expect(deleteMessage()).toBeFalsy();
			expect(ThoughtService.delete).not.toHaveBeenCalled();
		});

		it('should delete thought when user confirms deletion', () => {
			clickDelete();
			clickConfirmDelete();
			expect(ThoughtService.delete).toHaveBeenCalledWith(
				team.id,
				fakeThought.id
			);
		});

		it('should mark as discussed and switch animation class', () => {
			const retroItem = screen.getByTestId('retroItem');
			expect(retroItem.className).toContain(fadeInAnimationClass);
			expect(retroItem.className).not.toContain(fadeOutAnimationClass);
			clickCheckbox();
			expect(ThoughtService.updateDiscussionStatus).toHaveBeenCalledWith(
				team.id,
				fakeThought.id,
				true
			);
			expect(retroItem.className).toContain(fadeOutAnimationClass);
			expect(retroItem.className).not.toContain(fadeInAnimationClass);
		});
	});

	describe('When discussed', () => {
		beforeEach(() => {
			render(
				<RecoilRoot
					initializeState={({ set }) => {
						set(TeamState, team);
					}}
				>
					<RetroItem
						type={Topic.HAPPY}
						thought={{ ...fakeThought, discussed: true }}
					/>
				</RecoilRoot>
			);
		});

		it('should disable upvote button', () => {
			clickUpvote();
			expect(ThoughtService.upvoteThought).not.toHaveBeenCalled();
		});

		it('should disable edit button', () => {
			clickEdit();
			expect(textReadonly()).toBeTruthy();
		});

		it('should not open modal', () => {
			const retroItemButton = screen.queryByTestId('editableText-select');
			expect(retroItemButton).toBeNull();
			expect(screen.queryByTestId('retroItemModal')).toBeNull();
		});

		it('should not disable delete button', () => {
			clickDelete();
			expect(deleteMessage()).toBeTruthy();
		});

		it('should not disable checkbox button', () => {
			clickCheckbox();
			expect(ThoughtService.updateDiscussionStatus).toHaveBeenCalledWith(
				team.id,
				fakeThought.id,
				false
			);
		});
	});

	describe('When readonly', () => {
		beforeEach(() => {
			render(
				<RecoilRoot>
					<RetroItem readOnly={true} type={Topic.HAPPY} thought={fakeThought} />
				</RecoilRoot>
			);
		});

		it('should disable all buttons', () => {
			clickUpvote();
			expect(ThoughtService.upvoteThought).not.toHaveBeenCalled();

			clickEdit();
			expect(textReadonly()).toBeTruthy();

			clickDelete();
			expect(deleteMessage()).toBeFalsy();

			clickCheckbox();
			expect(ThoughtService.updateDiscussionStatus).not.toHaveBeenCalled();
		});

		it('should open retro item modal', () => {
			clickRetroItem();
			expect(screen.getByTestId('retroItemModal')).toBeDefined();
		});
	});
});

function editText(text: string) {
	const textArea = screen.getByTestId('editableText') as HTMLTextAreaElement;
	textArea.select();
	userEvent.type(textArea, text);
}

function clickRetroItem() {
	userEvent.click(screen.getByTestId('editableText-select'));
}

function clickUpvote() {
	userEvent.click(screen.getByTestId('retroItem-upvote'));
}

function clickEdit() {
	userEvent.click(screen.getByTestId('editButton'));
}

function clickDelete() {
	userEvent.click(screen.getByTestId('deleteButton'));
}

function clickCheckbox() {
	userEvent.click(screen.getByTestId('checkboxButton'));
}

function clickCancelDelete() {
	userEvent.click(screen.getByText('No'));
}

function clickConfirmDelete() {
	userEvent.click(screen.getByText('Yes'));
}

function escapeKey() {
	userEvent.type(document.body, '{Escape}');
}

function textReadonly() {
	return screen.getByTestId('editableText').getAttribute('readonly') === '';
}

function deleteMessage() {
	return screen.queryByText('Delete this Thought?');
}