import * as React from 'react';
import { observer } from 'mobx-react';

import styled from '../../styled-components';
import { Schema } from '../Schema';
import { EventModel } from '../../services/models/Event';
import { Markdown } from '../Markdown/Markdown';
import { StyledResponseTitle } from '../Responses/styled.elements';

export interface EventViewProps {
  event: EventModel;
}

export const EventView = observer(({ event }: EventViewProps): React.ReactElement => {
  const { event: name, text, expanded, schema } = event;

  const empty = React.useMemo<boolean>(() => !schema, [schema]);

  return (
    <div>
      <StyledResponseTitle
        onClick={() => event.toggle()}
        type={event.type}
        empty={empty}
        title=""
        opened={expanded}
        code={name}
      />
      {expanded && !empty && (
        <EventDetailsWrap>
          {text && <Markdown compact={true} inline={true} source={text} />}
          {schema && <Schema skipWriteOnly={true} key="schema" schema={schema} />}
        </EventDetailsWrap>
      )}
    </div>
  );
});

const EventDetailsWrap = styled.div`
  padding: 10px;
`;
