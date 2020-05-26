import React from 'react';

import ErrorPage from '../components/ErrorPage';

import { generateNotFoundError } from './errors';

// A global variable access req in `render`
let reqRes = null;

/**
 * To handle 404 errors from a page component
 *
 * @param {func} getParamsFromProps: must return an object like { isNotFound: boolean, searchTerm: string | null }
 */
const with404Error = getParamsFromProps => Component => {
  return class SSRError extends React.Component {
    static async getInitialProps(ctx) {
      reqRes = ctx.res;
      if (Component.getInitialProps) {
        return Component.getInitialProps(ctx);
      } else {
        return {};
      }
    }

    render() {
      const params = getParamsFromProps(this.props);
      if (params.isNotFound) {
        if (reqRes) {
          reqRes.statusCode = 404;
        }

        return <ErrorPage error={generateNotFoundError(params.searchTerm)} log={false} />;
      }

      return <Component {...this.props} reqRes={reqRes} />;
    }
  };
};

export default with404Error;
