import * as React from 'react';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';

describe('WebPartErrorBoundary', () => {
  it('exposes a fallback render when an error was captured', () => {
    const boundary = new WebPartErrorBoundary({
      title: 'Error',
      message: 'Fallback',
      children: React.createElement('span', null, 'child')
    });

    boundary.state = {
      hasError: true
    };

    const rendered = boundary.render() as React.ReactElement;
    const flattenedChildren = React.Children.toArray(rendered.props.children)
      .map((child) => {
        if (typeof child === 'string') {
          return child;
        }

        if (React.isValidElement(child)) {
          return child.props.children;
        }

        return '';
      })
      .join(' ');

    expect(flattenedChildren).toContain('Error');
    expect(flattenedChildren).toContain('Fallback');
  });
});
