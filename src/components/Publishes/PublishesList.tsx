import * as React from 'react';

import styled from '../../styled-components';
import { EventModel } from '../../services/models/Event';
import { EventView } from './Event';

export interface PublishesListProps {
  publishes: EventModel[];
}

export class PublishesList extends React.PureComponent<PublishesListProps> {
  render() {
    const { publishes } = this.props;

    if (!publishes || publishes.length === 0) {
      return null;
    }

    return (
      <div>
        <PublishesHeader> Events </PublishesHeader>
        {publishes.map(event => {
          return <EventView key={event.event} event={event} />;
        })}
      </div>
    );
  }
}

const PublishesHeader = styled.h3`
  font-size: 1.3em;
  padding: 0.2em 0;
  margin: 3em 0 1.1em;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: normal;
`;
