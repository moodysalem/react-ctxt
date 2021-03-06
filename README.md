# [![Build Status](https://travis-ci.org/moodysalem/react-ctxt.svg?branch=gh-pages)](https://travis-ci.org/moodysalem/react-ctxt) [![npm](https://img.shields.io/npm/v/react-ctxt.svg)](https://www.npmjs.com/package/react-ctxt) react-ctxt

An alternative to using React context that provides a similar mechanism for passing a prop all the way down the tree. It uses `react-side-effect` to share state across the app, and forces updates on any components that rely on context when the context changes.

## Purpose
Provide a replacement API for React context that meets all the use cases using only the props API and familiar JSX.

## Differences
Providers in react context can live anywhere and context is merged throughout the application, with context from the children taking precedence in the final context.

This makes this component not safe for server-side rendering. Multiple synchronous renders will clear the shared context, but simultaneous renders may update the same shared context object.

## Example
A provider adds some variables to the application context, and Inject passes context as a prop to its children. It has an optional parameter to require particular context variables that prevents rendering the child until the context is available.

```jsx
import React, { PureComponent } from 'react';
import { Inject, Provider } from 'react-ctxt';

class ThemedComponent extends PureComponent {
  static propTypes = {
    context: PropTypes.shape(
      {
        theme: PropTypes.shape(
          {
            primaryColor: PropTypes.string.isRequired,
            secondaryColor: PropTypes.string.isRequired
          }
        ).isRequired
      }
    )
  };

  render() {
    const { context } = this.props;

    return (
      <div style={{ color: context.theme.primaryColor, backgroundColor: context.theme.secondaryColor }}>
        Hello World!
      </div>
    );
  }
}

const SomeComponent = props => (
  <div {...props}>
    <Inject requires="theme">
      <ThemedComponent/>
    </Inject>
  </div>
);

class App extends PureComponent {
  render() {

    return (
      <div>
        <SomeComponent/>

        <Provider provides={{ theme: { primaryColor: 'red', secondaryColor: 'blue' } }}/>
      </div>
    );
  }
}
```
