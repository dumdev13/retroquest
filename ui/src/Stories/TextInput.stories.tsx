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

import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import TextField from '../Common/TextField/TextField';
import Topic from '../Types/Topic';

export default {
	title: 'components/TextField',
	component: TextField,
} as ComponentMeta<typeof TextField>;

const props = {
	placeholder: 'Enter A Thought',
	handleSubmission(text: string) {
		alert(`Submitting: ${text}`);
	},
};

const Template: ComponentStory<typeof TextField> = () => (
	<span
		style={{
			display: 'flex',
			flexWrap: 'wrap',
			justifyContent: 'space-between',
			maxWidth: '800px',
		}}
	>
		<TextField {...props} type={Topic.HAPPY} />
		<TextField {...props} type={Topic.CONFUSED} />
		<TextField {...props} type={Topic.UNHAPPY} />
		<TextField {...props} type={Topic.ACTION} />
	</span>
);

export const Example = Template.bind({});