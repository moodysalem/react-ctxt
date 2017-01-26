import React, { Children, cloneElement, Component, PropTypes } from 'react';
import withSideEffect from 'react-side-effect';
import isEqual from 'deep-equal';

export const DEFAULT_CONTEXT_NAME = '_GLOBAL_CONTEXT';

// a function for generating a random string
const id = () => Math.random().toString(36).substring(7);

// the basis of this component is a few shared singleton objects
const
  // stores all the context information
  CONTEXTS = {},
  // stores inject instance registrations
  INJECTION_INSTANCES = {};

const PROVIDER_PROP_TYPES = {
  // the name of the context for which this component is providing data
  contextName: PropTypes.string,

  // the data to provide
  provides: PropTypes.object.isRequired
};

/**
 * This class when rendered provides data for its context
 */
class ProviderBase extends Component {
  static propTypes = PROVIDER_PROP_TYPES;

  render() {
    return null;
  }
}

/**
 * Merges a bunch of context data into a single context object, where the providers at the lowest level take precedence
 * @param propsList
 * @returns {{}}
 */
const reducePropsToState = propsList => {
  const newContexts = {};

  propsList.forEach(
    ({ contextName = DEFAULT_CONTEXT_NAME, provides }) => {
      // if no context yet exists create it
      newContexts[ contextName ] = newContexts[ contextName ] || {};

      // and assign the provided data to that context
      Object.assign(newContexts[ contextName ], provides);
    }
  );

  return newContexts;
};

const handleStateChangeOnClient = newContext => {
  // used to keep track of all the contexts that have been updated
  const updatedContexts = {};

  // for each of the keys in the new context, update the CONTEXTS shared variable
  Object.keys(newContext)
    .concat(Object.keys(CONTEXTS))
    .forEach(
      contextName => {
        // we have already compared this contextName
        if (updatedContexts[ contextName ]) {
          return;
        }

        if (!isEqual(newContext[ contextName ], CONTEXTS[ contextName ])) {
          CONTEXTS[ contextName ] = newContext[ contextName ];
          updatedContexts[ contextName ] = true;
        }
      }
    );

  // now for each of the contexts we have updated, we need to update the registered instances
  Object.keys(updatedContexts)
    .forEach(
      updatedContextName => {
        const injections = INJECTION_INSTANCES[ updatedContextName ];
        if (injections) {
          Object.values(injections).forEach(instance => instance.forceUpdate());
        }
      }
    );

};


export const Provider = withSideEffect(reducePropsToState, handleStateChangeOnClient)(ProviderBase);
Provider.propTypes = PROVIDER_PROP_TYPES;


/**
 * This class takes some context and injects it into its children as a prop
 */
export class Inject extends Component {
  static propTypes = {
    // the name of the context
    contextName: PropTypes.string,

    // any context variables required to render the children
    requires: PropTypes.oneOfType([ PropTypes.string, PropTypes.arrayOf(PropTypes.string) ]),

    // the child to get the injected context
    children: PropTypes.node.isRequired
  };

  static defaultProps = {
    contextName: DEFAULT_CONTEXT_NAME,
    requires: null
  };

  constructor(props, context) {
    super(props, context);
    this._id = id();
    this.registerInstance(props.contextName);
  }

  _id = id();

  componentWillReceiveProps({ contextName }) {
    if (contextName !== this.props.contextName) {
      this.registerInstance(contextName);
      this.deRegisterInstance(this.props.contextName);
    }
  }

  componentWillUnmount() {
    this.deRegisterInstance(this.props.contextName);
  }

  registerInstance(contextName) {
    if (!INJECTION_INSTANCES[ contextName ]) {
      INJECTION_INSTANCES[ contextName ] = {};
    }

    INJECTION_INSTANCES[ contextName ][ this._id ] = this;
  }

  deRegisterInstance(contextName) {
    if (!INJECTION_INSTANCES[ contextName ]) {
      return;
    }

    delete INJECTION_INSTANCES[ contextName ][ this._id ];
  }

  render() {
    const { requires, children, contextName, ...rest } = this.props;

    const context = CONTEXTS[ contextName ];

    if (Array.isArray(requires)) {
      for (let key of requires) {
        if (typeof context[ key ] === 'undefined') {
          return null;
        }
      }
    } else if (requires !== null) {
      if (typeof context[ requires ] === 'undefined') {
        return null;
      }
    }

    return cloneElement(
      Children.only(this.props.children),
      { ...rest, context }
    );
  }
}