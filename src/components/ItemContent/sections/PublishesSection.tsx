import { useCallback, useContext, useMemo, useRef } from 'react';
import { styled } from 'styled-components';
import { useAtomValue, useSetAtom } from 'jotai';

import type { BaseSyntheticEvent, ReactElement } from 'react';
import type { Node } from '@markdoc/markdoc';
import type { ItemContentNode } from '../../../types/content.js';

import { Panel } from '@redocly/theme/components/Panel/Panel';
import { PanelHeader } from '@redocly/theme/components/Panel/PanelHeader';
import { PanelHeaderTitle } from '@redocly/theme/components/Panel/PanelHeaderTitle';

import { StyledBadge } from '../../common/Badge.js';
import {
  DeepLinkAnchor,
  deepLinkHoverReveal,
  DEEP_LINK_ANCHOR_ATTR,
} from '../../common/DeepLinkAnchor.js';
import { itemStoreAtom, itemStoreFieldAtom } from '../../../jotai/itemStore.js';
import {
  DeepLinkSectionContext,
  ItemIdContext,
  useDeepLinkUrl,
} from '../../../hooks/useDeepLinkSection.js';
import type { DeepLinkSectionValue } from '../../../hooks/useDeepLinkSection.js';
import { useSpecTranslate } from '../../../hooks/useTranslate.js';
import {
  buildOpenApiSectionSuffix,
  PUBLISHES_SECTION,
  getDeepLinkId,
} from '../../../utils/deep-link.js';
import { Markdown } from '../../common/Markdown.js';
import { SchemaView } from '../../Schema/SchemaView.js';

/** The deep-link icon sits in the panel header, and its click target is the svg inside the
 *  anchor — so `instanceof HTMLAnchorElement` (what Panel checks) misses it and following a
 *  callback's own link would collapse the panel. */
function isAnchorClick(event: BaseSyntheticEvent): boolean {
  return event.target instanceof Element && event.target.closest('a') !== null;
}

type PublishOperation = {
  publishName: string;
  description?: string | Node | Node[];
  deprecated?: boolean;
  schemaId: string;
};

function PublishOperationItem({
  operation,
  publishName,
  isExpanded,
  onToggle,
}: {
  operation: PublishOperation;
  publishName: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}): ReactElement {
  const {
    description,
    deprecated,
    schemaId,
  } = operation;
  const displayName = operation.publishName;
  // Must match the variantSection in PublishPayloadItem so the picker and schema share a store.
  const sectionData = useMemo<DeepLinkSectionValue>(
    () => ({ t: 'request', schemaId }),
    [schemaId],
  );

  const cbScopeSuffix = buildOpenApiSectionSuffix(PUBLISHES_SECTION, publishName);
  const cbDeepLink = useDeepLinkUrl(cbScopeSuffix);
  const headerRef = useRef<HTMLDivElement>(null);

  const translate = useSpecTranslate();
  const deprecatedLabel = translate('badges.deprecated', 'deprecated');

  return (
    <PublishPanel
      header={({ expanded, toggle }) => (
        <PublishHeader
          ref={headerRef}
          expanded={expanded}
          toggle={(e) => {
            if (isAnchorClick(e)) return;
            toggle?.(e);
            onToggle(publishName);
          }}
          id={getDeepLinkId(cbDeepLink)}
        >
          {cbDeepLink && <DeepLinkAnchor to={cbDeepLink} label={`link to ${displayName}`} />}
          <Trigger>
            <CircleIconWrap type="button" aria-expanded={expanded} aria-label={displayName}>
              <CircleIcon $expanded={expanded} aria-hidden="true" />
            </CircleIconWrap>
            <TitleWrap>
              <PublishTitle $deprecated={deprecated}>{displayName}</PublishTitle>
              {deprecated ? <StyledBadge $deprecated>{deprecatedLabel}</StyledBadge> : null}
            </TitleWrap>
          </Trigger>
        </PublishHeader>
      )}
      expanded={isExpanded}
      className="panel-response-callback"
    >
      <PublishDetailsWrap>
        {description && (
          <DescriptionWrap>
            <Markdown source={description} />
          </DescriptionWrap>
        )}
        <DeepLinkSectionContext.Provider value={sectionData}>
          <SchemaView schemaId={schemaId} />
        </DeepLinkSectionContext.Provider>
        <LeftBorder />
      </PublishDetailsWrap>
    </PublishPanel>
  );
}

export function PublishesSection({ node }: { node: ItemContentNode }): ReactElement {
  const op = node.publish;
  const itemId = useContext(ItemIdContext) ?? '';
  const selectedPublish = useAtomValue(itemStoreFieldAtom({ itemId, key: 'selectedPublish' }));
  const setItemState = useSetAtom(itemStoreAtom(itemId));

  const handleToggle = useCallback(
    (id: string) => {
      setItemState((current) => ({ selectedPublish: current.selectedPublish === id ? '' : id }));
    },
    [setItemState],
  );

  if (!op) {
    return <></>;
  }

  return (
    <div>
      <PublishOperationItem
        key={op.publishName}
        operation={op}
        publishName={op.publishName}
        isExpanded={selectedPublish === op.publishName}
        onToggle={handleToggle}
      />
    </div>
  );
}

const Trigger = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  max-width: calc(100% - 9px - var(--spacing-unit));
  justify-content: flex-start;
`;

const TitleWrap = styled.div`
  flex: 1;
  min-width: 0;
  line-height: var(--line-height-base);
`;

const PublishPanel = styled(Panel)`
  border-bottom: 1px solid var(--border-color-primary);
  border-radius: 0;
  &:not(:last-child) {
    margin-bottom: 0;
  }
`;

const PublishHeader = styled(PanelHeader)`
  padding: var(--spacing-sm) 0 var(--spacing-sm) calc(var(--spacing-unit) / 2);
  margin: 0;
  border-radius: 0;
  line-height: var(--line-height-base);
  position: relative;

  & > [${DEEP_LINK_ANCHOR_ATTR}] {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
  }

  ${deepLinkHoverReveal}
`;

const CircleIconWrap = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  gap: var(--spacing-xxs);
  color: var(--text-color-secondary);
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  line-height: var(--line-height-base);
`;

const CircleIcon = styled.span<{ $expanded?: boolean }>`
  position: relative;
  display: inline-block;
  flex: none;
  width: 20px;
  height: 20px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color-primary);
  border-radius: 50%;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--text-color-secondary);
    border-radius: var(--border-width);
  }

  &::before {
    width: var(--spacing-xs);
    height: var(--border-width);
  }

  &::after {
    width: var(--border-width);
    height: var(--spacing-xs);
    opacity: ${({ $expanded }) => ($expanded ? 0 : 1)};
  }
`;

const PublishTitle = styled(PanelHeaderTitle)<{ $deprecated?: boolean }>`
  text-decoration: ${({ $deprecated }) => ($deprecated ? 'line-through' : 'none')};
  display: inline;
  margin: 0 4px 0 0;
  color: var(--panel-response-callback-heading-text-color);
  font-weight: var(--font-weight-medium);
  word-break: break-all;
`;

const PublishDetailsWrap = styled.div`
  position: relative;
  .property:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const LeftBorder = styled.div`
  position: absolute;
  height: calc(100% + 15px);
  border-left: 1px solid var(--border-color-primary);
  top: -15px;
  left: -13px;
  z-index: 0;
`;

const DescriptionWrap = styled.div`
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--text-color-primary);
  margin-bottom: var(--spacing-sm);

  p:first-of-type {
    margin-top: 0;
  }
  p:last-of-type {
    margin-bottom: 0;
  }
`;