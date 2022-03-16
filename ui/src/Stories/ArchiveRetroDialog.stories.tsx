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

import React, { createRef } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { RecoilRoot } from 'recoil';

import ArchiveRetroDialog from '../App/Team/Retro/RetroSubheader/ArchiveRetroDialog/ArchiveRetroDialog';
import { PrimaryButton } from '../Common/Buttons/Button';
import { ModalMethods } from '../Common/Modal/Modal';

export default {
	title: 'components/ArchiveRetroDialog',
	component: ArchiveRetroDialog,
} as ComponentMeta<typeof ArchiveRetroDialog>;

const Template: ComponentStory<typeof ArchiveRetroDialog> = () => {
	const ref = createRef<ModalMethods>();

	return (
		<RecoilRoot>
			<PrimaryButton onClick={() => ref.current?.show()}>
				Archive Retro
			</PrimaryButton>
			<ArchiveRetroDialog ref={ref} />
		</RecoilRoot>
	);
};

export const Example = Template.bind({});