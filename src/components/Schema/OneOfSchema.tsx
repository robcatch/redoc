import { observer } from 'mobx-react';
import * as React from 'react';

import {
  OneOfButton as StyledOneOfButton,
  OneOfLabel,
  OneOfList,
} from '../../common-elements/schema';
import { Badge } from '../../common-elements/shelfs';
import { SchemaModel } from '../../services/models';
import { Schema, SchemaProps } from './Schema';
import { DiscriminatorDropdown } from './DiscriminatorDropdown';
import { OptionsConsumer } from '../OptionsProvider';

export interface OneOfButtonProps {
  subSchema: SchemaModel;
  idx: number;
  schema: SchemaModel;
}

@observer
export class OneOfButton extends React.Component<OneOfButtonProps> {
  render() {
    const { idx, schema, subSchema } = this.props;
    return (
      <StyledOneOfButton
        $deprecated={subSchema.deprecated}
        $active={idx === schema.activeOneOf}
        onClick={this.activateOneOf}
      >
        {subSchema.title || subSchema.typePrefix + subSchema.displayType}
      </StyledOneOfButton>
    );
  }

  activateOneOf = () => {
    this.props.schema.activateOneOf(this.props.idx);
  };
}

@observer
export class OneOfSchema extends React.Component<SchemaProps> {
  render() {
    const {
      schema: { oneOf },
      schema,
    } = this.props;

    if (oneOf === undefined) {
      return null;
    }
    const activeSchema = oneOf[schema.activeOneOf];

    return (
      <div>
        <OneOfLabel> {schema.oneOfType} </OneOfLabel>
        <OneOfList>
          <OptionsConsumer>
            {options =>
              options.maxOneOfButtons && oneOf.length > options.maxOneOfButtons ? (
                <DiscriminatorDropdown
                  parent={schema}
                  enumValues={oneOf.map(
                    subSchema => subSchema.title || subSchema.typePrefix + subSchema.displayType,
                  )}
                />
              ) : (
                oneOf?.map((subSchema, idx) => (
                  <OneOfButton
                    key={subSchema.pointer}
                    schema={schema}
                    subSchema={subSchema}
                    idx={idx}
                  />
                ))
              )
            }
          </OptionsConsumer>
        </OneOfList>
        <div>
          {oneOf[schema.activeOneOf].deprecated && <Badge type="warning">Deprecated</Badge>}
        </div>
        <Schema {...this.props} schema={activeSchema} showFieldDetails={true} noItemsType={true} />
      </div>
    );
  }
}
