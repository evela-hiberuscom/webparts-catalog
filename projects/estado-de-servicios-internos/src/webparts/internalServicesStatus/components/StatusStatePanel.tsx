import * as React from "react";
import { DefaultButton, Icon, Spinner, Text } from "@fluentui/react";
import styles from "./InternalServicesStatus.module.scss";

export interface IStatusStatePanelProps {
  status: "loading" | "empty" | "error";
  title: string;
  message: string;
  onRetry: () => void;
}

export function StatusStatePanel(props: IStatusStatePanelProps): React.ReactElement {
  if (props.status === "loading") {
    return (
      <div className={styles.partialBanner} role="status" aria-live="polite">
        <Spinner label={props.message} />
      </div>
    );
  }

  return (
    <div className={styles.partialBanner}>
      <Icon iconName={props.status === "error" ? "Warning" : "Info"} />
      <div>
        <Text variant="large" as="h3">
          {props.title}
        </Text>
        <Text variant="small">{props.message}</Text>
      </div>
      <DefaultButton text="Reintentar" onClick={props.onRetry} />
    </div>
  );
}
