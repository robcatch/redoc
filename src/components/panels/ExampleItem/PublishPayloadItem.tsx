import { useContext, useMemo } from 'react';
import { useAtomValue } from 'jotai';

import type { ReactElement } from 'react';
import type { PublishPayloadPanelItem } from '../../../types/content.js';

import { useResolvedExamples } from '../../ItemContent/hooks.js';
import { useBodySamplingSchemaId, useSchemaVariantSelection } from './hooks.js';
import { PayloadDisplay, VariantPicker } from './selectors.js';
import { itemStoreFieldAtom } from '../../../jotai/itemStore.js';
import { ItemIdContext } from '../../../hooks/useDeepLinkSection.js';

const ACTIVE_MEDIA_TYPE = 'application/json';

export function PublishPayloadItem({
  node,
}: {
  node: PublishPayloadPanelItem;
}): ReactElement | null {
  const itemId = useContext(ItemIdContext) ?? '';
  const selectedPublish = useAtomValue(itemStoreFieldAtom({ itemId, key: 'selectedPublish' }));
  const publishName = node.publishName;

  const isVisible = publishName != null && selectedPublish === publishName;
  const effectiveSchemaId = node.schemaId;

  const variantSection = useMemo(
    () => ({ t: 'request', schemaId: effectiveSchemaId }),
    [effectiveSchemaId],
  );
  const discriminatorSelection = useSchemaVariantSelection(
    effectiveSchemaId,
    variantSection,
  );
  const sampleSchemaId = useBodySamplingSchemaId(
    effectiveSchemaId,
    ACTIVE_MEDIA_TYPE,
    variantSection,
  );
  const resolved = useResolvedExamples(
    sampleSchemaId,
    undefined,
    'response',
    ACTIVE_MEDIA_TYPE,
    variantSection,
  );

  const payload = resolved[0];

  if (!isVisible) {
    return null;
  }

  return <>
    <VariantPicker selection={discriminatorSelection} />
    <PayloadDisplay
      payload={payload}
      emptyMessage="// No publish payload"
      mediaType={ACTIVE_MEDIA_TYPE}
    />
  </>
}
