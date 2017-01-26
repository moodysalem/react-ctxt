# react-ctxt

An alternative to using React's experimental context feature that doesn't rely on React context but provides a similar 
mechanism for passing a prop all the way down the tree.

## Purpose
Provide a replacement API for React context that meets all the use cases using only the props API and familiar JSX.

## Differences
Providers in react context can live anywhere and provide variables for their parent components. Context is just not just 
provided for the children of a Provider component. This is due to the technical difficulty of trying to figure out component
hierarchies without slipping into React internals.

## Example

```jsx
import React, { PureComponent } from 'react';
import { inject, Provider } from 'rcplx';

class ThemedComponent extends PureComponent {
  static propTypes = {
    theme: PropTypes.shape(
      {
        primaryColor: PropTypes.string.isRequired,
        secondaryColor: PropTypes.string.isRequired
      }
    ).isRequired
  };

  render() {
    return (
      <div>Hello World!</div>
    );
  }
}

// returns a new component that receives its context from the parent
export default inject([ 'theme' ])(ThemedComponent);

const ComponentWrapper = props => <div {...props}><ThemedComponent/></div>;

class App extends PureComponent {
  render() {

    return (
      <Provide context={{ theme: { primaryColor: 'red', secondaryColor: 'blue' } }}>
        <ComponentWrapper/>
      </Provide>
    );
  }
}
```
