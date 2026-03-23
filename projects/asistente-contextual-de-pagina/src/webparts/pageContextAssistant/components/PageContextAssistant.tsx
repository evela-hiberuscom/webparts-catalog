import * as React from "react";
import ContextHelpPanel from "./ContextHelpPanel";
import type { IPageContextAssistantProps } from "./IPageContextAssistantProps";
import { usePageContextAssistant } from "../hooks/usePageContextAssistant";

export default function PageContextAssistant(props: IPageContextAssistantProps): React.ReactElement {
  const { status, result, error, isExpanded, refresh, toggleExpanded } = usePageContextAssistant(
    props.service,
    props.request,
    props.collapsedByDefault
  );

  return (
    <ContextHelpPanel
      title={props.title}
      description={props.description}
      pageContextKey={props.request.contextKeyOverride ?? props.request.pageContextKey}
      userDisplayName={props.userDisplayName}
      status={status}
      result={result}
      error={error}
      isExpanded={isExpanded}
      onToggleExpanded={toggleExpanded}
      onRefresh={refresh}
    />
  );
}
