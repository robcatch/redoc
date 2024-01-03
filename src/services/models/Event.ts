import { action, observable, makeObservable } from 'mobx';

import { OpenAPISchema } from '../../types';
import { SchemaModel } from './Schema';
import type { OpenAPIParser } from '../OpenAPIParser';
import type { RedocNormalizedOptions } from '../RedocNormalizedOptions';

type EventProps = {
  parser: OpenAPIParser;
  event: string;
  text: string;
  options: RedocNormalizedOptions;
};

export class EventModel {
  @observable
  expanded: boolean = false;

  event: string;
  text: string;
  type: string;
  schema?: SchemaModel;

  constructor({ parser, event, text, options }: EventProps) {
    makeObservable(this);

    this.event = event;
    this.text = text;
    this.type = 'info';

    const deref = parser.deref({ $ref: `#/components/schemas/${event}` });
    const schema = deref.resolved as OpenAPISchema;
    if (schema.type === 'object') {
      this.schema = new SchemaModel(parser, schema, '', options);
    }
  }

  @action
  toggle() {
    this.expanded = !this.expanded;
  }
}
