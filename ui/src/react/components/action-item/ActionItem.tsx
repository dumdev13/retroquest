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

import * as React from 'react';
import classnames from 'classnames';

import Action from '../../types/Action';
import Topic from '../../types/Topic';
import ColumnItem from '../column-item/ColumnItem';

import Assignee from './assignee/Assignee';
import { DateCreated } from './date-created/DateCreated';

import './ActionItem.scss';

const NO_OP = () => undefined;

type ActionItemProps = {
  action: Action;
  readOnly?: boolean;
  onSelect?: () => void;
  onEditTask?: (action: Action, updatedTask: string) => void;
  onEditAssignee?: (action: Action, assignee: string) => void;
  onDelete?: (action: Action) => void;
  onComplete?: (action: Action) => void;
};

function ActionItem(props: ActionItemProps) {
  const {
    action,
    readOnly = false,
    onSelect,
    onEditTask = NO_OP,
    onEditAssignee = NO_OP,
    onDelete = NO_OP,
    onComplete = NO_OP,
  } = props;

  return (
    <ColumnItem
      data-testid="actionItem"
      className={classnames('action-item', { completed: action.completed })}
      type={Topic.ACTION}
      text={action.task}
      checked={action.completed}
      readOnly={readOnly}
      onSelect={onSelect}
      onEdit={(updatedTask) => onEditTask(action, updatedTask)}
      onDelete={() => onDelete(action)}
      onCheck={() => onComplete(action)}
      customButtons={({ editing, deleting }) => (
        <DateCreated date={action.dateCreated} disabled={(action.completed || editing || deleting) && !readOnly} />
      )}
    >
      {({ editing, deleting }) => (
        <Assignee
          assignee={action.assignee}
          onAssign={(updatedTask) => onEditAssignee(action, updatedTask)}
          readOnly={readOnly || action.completed}
          editing={editing}
          deleting={deleting}
        />
      )}
    </ColumnItem>
  );
}

export default ActionItem;
