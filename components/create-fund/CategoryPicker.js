import React, { Fragment } from 'react';
import { useRouter } from 'next/router';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import styled from 'styled-components';

import Container from '../Container';
import { Box, Flex } from '../Grid';
import Link from '../Link';
import StyledButton from '../StyledButton';
import { H1, P } from '../Text';

const Image = styled.img`
  @media screen and (min-width: 52em) {
    height: 256px;
    width: 256px;
  }
  @media screen and (max-width: 40em) {
    height: 192px;
    width: 192px;
  }
  @media screen and (min-width: 40em) and (max-width: 52em) {
    height: 208px;
    width: 208px;
  }
`;

const messages = defineMessages({
  foundation: { id: 'createCollective.category.foundation', defaultMessage: 'For non-profit initiatives' },
  fund: { id: 'createCollective.category.fund', defaultMessage: 'For other initiatives' },
});

const CollectiveCategoryPicker = () => {
  const router = useRouter();
  const { formatMessage } = useIntl();

  return (
    <Fragment>
      <Box mb={4} mt={5}>
        <H1 fontSize={['H5', 'H3']} lineHeight={['H5', 'H3']} fontWeight="bold" color="black.900" textAlign="center">
          <FormattedMessage id="fund.create" defaultMessage="Create a Fund" />
        </H1>
      </Box>
      <Flex flexDirection="column" justifyContent="center" alignItems="center" mb={[5, 6]}>
        <Box alignItems="center">
          <Flex justifyContent="center" alignItems="center" flexDirection={['column', 'row']}>
            <Container
              borderTop={['1px solid #E6E8EB', 'none']}
              alignItems="center"
              width={[null, 280, 312]}
              mb={[4, 0]}
            >
              <Flex flexDirection="column" justifyContent="center" alignItems="center">
                <Image
                  src="/static/images/create-collective/climateIllustration.png"
                  alt={formatMessage(messages.foundation)}
                />
                <Link
                  route="create-fund"
                  params={{
                    hostCollectiveSlug: router.query.hostCollectiveSlug,
                    verb: router.query.verb,
                    category: 'foundation',
                  }}
                >
                  <StyledButton fontSize="13px" buttonStyle="primary" minHeight="36px" mt={[2, 3]} mb={3} px={3}>
                    {formatMessage(messages.foundation)}
                  </StyledButton>
                </Link>
                <P textAlign="center">
                  It will be hosted by
                  <br />
                  Open Collective Foundation 501(c)(3).
                </P>
              </Flex>
            </Container>
          </Flex>
        </Box>
      </Flex>
    </Fragment>
  );
};

export default CollectiveCategoryPicker;
