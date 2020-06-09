import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';
import memoizeOne from 'memoize-one';

import { CollectiveType } from '../../lib/constants/collectives';

import CollectiveNavbar, { getSectionsForCollective } from '../CollectiveNavbar';
import Container from '../Container';

import Hero from './hero/Hero';
import SectionAbout from './sections/About';
import SectionBudget from './sections/Budget';
import SectionContribute from './sections/Contribute';
import SectionContributions from './sections/Contributions';
import SectionContributors from './sections/Contributors';
import SectionConversations from './sections/Conversations';
import SectionGoals from './sections/Goals';
import SectionLocation from './sections/Location';
import SectionParticipants from './sections/SponsorsAndParticipants';
import SectionTickets from './sections/Tickets';
import SectionTransactions from './sections/Transactions';
import SectionUpdates from './sections/Updates';
import { Sections } from './_constants';
import SectionContainer from './SectionContainer';
import sectionsWithoutPaddingBottom from './SectionsWithoutPaddingBottom';

/**
 * This is the collective page main layout, holding different blocks together
 * and watching scroll to synchronise the view for children properly.
 *
 * See design: https://www.figma.com/file/e71tBo0Sr8J7R5n6iMkqI42d/09.-Collectives?node-id=2338%3A36062
 */
class CollectivePage extends Component {
  static propTypes = {
    collective: PropTypes.object.isRequired,
    host: PropTypes.object,
    financialContributors: PropTypes.arrayOf(PropTypes.object),
    coreContributors: PropTypes.arrayOf(PropTypes.object),
    topOrganizations: PropTypes.arrayOf(PropTypes.object),
    topIndividuals: PropTypes.arrayOf(PropTypes.object),
    tiers: PropTypes.arrayOf(PropTypes.object),
    transactions: PropTypes.arrayOf(PropTypes.object),
    conversations: PropTypes.object,
    expenses: PropTypes.arrayOf(PropTypes.object),
    updates: PropTypes.arrayOf(PropTypes.object),
    events: PropTypes.arrayOf(PropTypes.object),
    connectedCollectives: PropTypes.arrayOf(PropTypes.object),
    LoggedInUser: PropTypes.object,
    isAdmin: PropTypes.bool.isRequired,
    isRoot: PropTypes.bool.isRequired,
    onPrimaryColorChange: PropTypes.func.isRequired,
    stats: PropTypes.shape({
      balance: PropTypes.number.isRequired,
      yearlyBudget: PropTypes.number.isRequired,
      updates: PropTypes.number.isRequired,
      backers: PropTypes.object,
    }),
    status: PropTypes.oneOf(['collectiveCreated', 'collectiveArchived']),
  };

  constructor(props) {
    super(props);
    this.sectionsRefs = {}; // This will store a map of sectionName => sectionRef
    this.navbarRef = React.createRef();
    this.state = { isFixed: false, selectedSection: null };
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScroll);
    this.onScroll(); // First tick in case scroll is restored when page loads
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  getSections = memoizeOne(props => {
    return getSectionsForCollective(props.collective, props.isAdmin);
  });

  onScroll = throttle(() => {
    // Ref may be null when NextJS hot reloads the page
    if (!this.navbarRef.current) {
      return;
    }

    let { isFixed, selectedSection } = this.state;

    // Fixes the Hero when a certain scroll threshold is reached
    if (this.navbarRef.current.getBoundingClientRect().top <= 0) {
      isFixed = true;
    } else if (isFixed) {
      isFixed = false;
    }

    // Get the currently section that is at the top of the screen.
    const distanceThreshold = 200;
    const breakpoint = window.scrollY + distanceThreshold;
    const sections = this.getSections(this.props);
    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionName = sections[i];
      const sectionRef = this.sectionsRefs[sectionName];
      if (sectionRef && breakpoint >= sectionRef.offsetTop) {
        selectedSection = sectionName;
        break;
      }
    }

    // Update the state only if necessary
    if (this.state.isFixed !== isFixed || this.state.selectedSection !== selectedSection) {
      this.setState({ isFixed, selectedSection });
    }
  }, 100);

  onSectionClick = sectionName => {
    const scrollOffset = window.innerHeight < 640 ? 30 : 0;
    // Need to take into account the mobile menu
    window.scrollTo(0, this.sectionsRefs[sectionName].offsetTop + scrollOffset);
    // Changing hash directly tends to make the page jump to the section without respect for
    // the smooth scroll behaviour, so we try to use `history.pushState` if available
    if (window.history.pushState) {
      window.history.pushState(null, null, `#section-${sectionName}`);
    } else {
      window.location.hash = `#section-${sectionName}`;
    }
  };

  getCallsToAction = memoizeOne((type, isHost, isAdmin, isRoot, canApply, canContact, isArchived, isActive, isFund) => {
    const isCollective = type === CollectiveType.COLLECTIVE;
    const isEvent = type === CollectiveType.EVENT;
    return {
      hasContact: !isAdmin && canContact,
      hasContribute: isFund && isActive,
      hasSubmitExpense: (isCollective || isEvent || (isHost && isActive)) && !isArchived,
      // Don't display Apply if you're the admin (you can go to "Edit Collective" for that)
      hasApply: canApply && !isAdmin,
      hasDashboard: isHost && isAdmin,
      hasManageSubscriptions: isAdmin && !isCollective && !isEvent,
      // Don't display "Add Funds" if it's an Host and you're the Admin
      addFunds: isRoot && type === CollectiveType.ORGANIZATION && !(isAdmin && isHost),
    };
  });

  onCollectiveClick = () => {
    window.scrollTo(0, 0);
  };

  renderSection(section) {
    switch (section) {
      case Sections.ABOUT:
        return <SectionAbout collective={this.props.collective} canEdit={this.props.isAdmin} />;
      case Sections.BUDGET:
        return (
          <SectionBudget
            collective={this.props.collective}
            transactions={this.props.transactions}
            expenses={this.props.expenses}
            stats={this.props.stats}
          />
        );
      case Sections.CONTRIBUTE:
        return (
          <SectionContribute
            status={this.props.status}
            collective={this.props.collective}
            tiers={this.props.tiers}
            events={this.props.events}
            connectedCollectives={this.props.connectedCollectives}
            contributors={this.props.financialContributors}
            contributorsStats={this.props.stats.backers}
            isAdmin={this.props.isAdmin}
          />
        );
      case Sections.CONTRIBUTORS:
        return (
          <SectionContributors
            collective={this.props.collective}
            financialContributors={this.props.financialContributors}
            coreContributors={this.props.coreContributors}
            stats={this.props.stats}
          />
        );
      case Sections.UPDATES:
        return (
          <SectionUpdates
            collective={this.props.collective}
            isAdmin={this.props.isAdmin}
            isLoggedIn={Boolean(this.props.LoggedInUser)}
          />
        );
      case Sections.CONTRIBUTIONS:
        return <SectionContributions collective={this.props.collective} />;
      case Sections.CONVERSATIONS:
        return <SectionConversations collective={this.props.collective} conversations={this.props.conversations} />;
      case Sections.TRANSACTIONS:
        return (
          <SectionTransactions
            collective={this.props.collective}
            isAdmin={this.props.isAdmin}
            isRoot={this.props.isRoot}
          />
        );
      case Sections.GOALS:
        return <SectionGoals collective={this.props.collective} />;
      case Sections.TICKETS:
        return (
          <SectionTickets
            collective={this.props.collective}
            tiers={this.props.tiers}
            isAdmin={this.props.isAdmin}
            contributors={this.props.financialContributors}
          />
        );
      case Sections.PARTICIPANTS:
        return <SectionParticipants collective={this.props.collective} LoggedInUser={this.props.LoggedInUser} />;
      case Sections.LOCATION:
        return <SectionLocation collective={this.props.collective} />;
      default:
        return null;
    }
  }

  render() {
    const { collective, host, isAdmin, isRoot, onPrimaryColorChange } = this.props;
    const { type, isHost, canApply, canContact, isActive, settings } = collective;
    const { isFixed, selectedSection } = this.state;
    const sections = this.getSections(this.props);
    const isFund = settings?.fund === true;
    const callsToAction = this.getCallsToAction(
      type,
      isHost,
      isAdmin,
      isRoot,
      canApply,
      canContact,
      collective.isArchived,
      isActive,
      isFund,
    );

    return (
      <Container
        position="relative"
        css={collective.isArchived ? 'filter: grayscale(100%);' : undefined}
        data-cy="collective-page-main"
      >
        <Hero
          collective={collective}
          host={host}
          isAdmin={isAdmin}
          callsToAction={callsToAction}
          onPrimaryColorChange={onPrimaryColorChange}
        />
        <Container mt={[0, -30]} position="sticky" top={0} zIndex={999} ref={this.navbarRef}>
          <CollectiveNavbar
            collective={collective}
            sections={sections}
            isAdmin={isAdmin}
            selected={selectedSection || sections[0]}
            onCollectiveClick={this.onCollectiveClick}
            callsToAction={callsToAction}
            hideInfos={!isFixed}
            isAnimated={true}
            onSectionClick={this.onSectionClick}
            LinkComponent={({ section, label, className }) => (
              <a
                data-cy={`section-${section}`}
                href={`#section-${section}`}
                className={className}
                onClick={e => e.preventDefault()}
              >
                {label}
              </a>
            )}
          />
        </Container>
        {sections.map((section, idx) => (
          <SectionContainer
            key={section}
            ref={sectionRef => (this.sectionsRefs[section] = sectionRef)}
            id={`section-${section}`}
            withPaddingBottom={idx === sections.length - 1 && !sectionsWithoutPaddingBottom[section]}
          >
            {this.renderSection(section, idx === sections.length - 1)}
          </SectionContainer>
        ))}
      </Container>
    );
  }
}

export default CollectivePage;
