import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';

interface IWebPartErrorBoundaryProps {
  title: string;
  message: string;
  children?: React.ReactNode;
}

interface IWebPartErrorBoundaryState {
  hasError: boolean;
}

export class WebPartErrorBoundary extends React.Component<IWebPartErrorBoundaryProps, IWebPartErrorBoundaryState> {
  public constructor(props: IWebPartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): IWebPartErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[WebPartErrorBoundary]', error, info.componentStack);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <MessageBar messageBarType={MessageBarType.error} isMultiline>
          <strong>{this.props.title}</strong>{' — '}{this.props.message}
        </MessageBar>
      );
    }

    return this.props.children;
  }
}
