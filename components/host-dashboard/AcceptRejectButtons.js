import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from '@apollo/react-components';
import gql from 'graphql-tag';
import { FormattedMessage } from 'react-intl';

import StyledButton from '../StyledButton';

import AppRejectionReasonModal from './AppRejectionReasonModal';

const ApproveCollectiveMutation = gql`
  mutation approveCollective($id: Int!) {
    approveCollective(id: $id) {
      id
      isActive
    }
  }
`;

const AcceptRejectButtons = ({ collective, host }) => {
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  return (
    <Fragment>
      <Mutation mutation={ApproveCollectiveMutation}>
        {(approveCollective, { loading }) => (
          <StyledButton
            m={1}
            loading={loading}
            onClick={() => approveCollective({ variables: { id: collective.id } })}
            data-cy={`${collective.slug}-approve`}
            buttonStyle="success"
            minWidth={125}
          >
            <FormattedMessage id="host.pending-applications.approve" defaultMessage="Approve" />
          </StyledButton>
        )}
      </Mutation>
      <StyledButton buttonStyle="danger" minWidth={125} m={1} onClick={() => setShowRejectionModal(true)}>
        <FormattedMessage id="host.pending-applications.reject" defaultMessage="Reject" />
      </StyledButton>
      {showRejectionModal && (
        <AppRejectionReasonModal
          show={showRejectionModal}
          onClose={() => setShowRejectionModal(false)}
          collectiveId={collective.id}
          hostCollectiveSlug={host.slug}
        />
      )}
    </Fragment>
  );
};

AcceptRejectButtons.propTypes = {
  collective: PropTypes.shape({
    id: PropTypes.number,
    slug: PropTypes.string,
  }),
  host: PropTypes.shape({
    slug: PropTypes.string,
  }),
};

export default AcceptRejectButtons;
