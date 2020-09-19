import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Comment, Info, Reply } from '@material-ui/icons';
import { Menu, MenuItem, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import AnalyticsActions from '../../actions/AnalyticsActions';
import AppActions from '../../actions/AppActions';
import AppStore from '../../stores/AppStore';
import { historyPush, isWebApp } from '../../utils/cordovaUtils';
import ShareActions from '../../actions/ShareActions';
import { stringContains } from '../../utils/textFormat';
import VoterStore from '../../stores/VoterStore';
import { renderLog } from '../../utils/logging';

class ShareButtonDesktopTablet extends Component {
  static propTypes = {
    classes: PropTypes.object,
    candidateShare: PropTypes.bool,
    measureShare: PropTypes.bool,
    officeShare: PropTypes.bool,
    organizationShare: PropTypes.bool,
    organizationWeVoteId: PropTypes.string,
    readyShare: PropTypes.bool,
    shareButtonText: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      anchorEl: null,
      chosenPreventSharingOpinions: false,
      openShareMenu: false,
    };
    this.handleShareButtonClick = this.handleShareButtonClick.bind(this);
    this.handleCloseMenu = this.handleCloseMenu.bind(this);
  }

  componentDidMount () {
    this.appStoreListener = AppStore.addListener(this.onAppStoreChange.bind(this));
    const chosenPreventSharingOpinions = AppStore.getChosenPreventSharingOpinions();
    this.setState({
      chosenPreventSharingOpinions,
    });
  }

  componentWillUnmount () {
    this.appStoreListener.remove();
  }

  onAppStoreChange () {
    const chosenPreventSharingOpinions = AppStore.getChosenPreventSharingOpinions();
    this.setState({
      chosenPreventSharingOpinions,
    });
  }

  handleShareButtonClick (event) {
    const { candidateShare, measureShare, officeShare, organizationShare, organizationWeVoteId, readyShare } = this.props;
    const { href: destinationFullUrl } = window.location;
    const ballotItemWeVoteId = '';
    const googleCivicElectionId = 0;
    let kindOfShare = 'BALLOT';
    if (candidateShare) {
      kindOfShare = 'CANDIDATE';
    } else if (measureShare) {
      kindOfShare = 'MEASURE';
    } else if (officeShare) {
      kindOfShare = 'OFFICE';
    } else if (organizationShare) {
      kindOfShare = 'ORGANIZATION';
    } else if (readyShare) {
      kindOfShare = 'READY';
    }
    ShareActions.sharedItemSave(destinationFullUrl, kindOfShare, ballotItemWeVoteId, googleCivicElectionId, organizationWeVoteId);
    this.setState({ anchorEl: event.currentTarget, openShareMenu: true });
  }

  handleCloseMenu () {
    this.setState({ anchorEl: null, openShareMenu: false });
  }

  openShareModal (withOpinions = false) {
    const { candidateShare, measureShare, officeShare, organizationShare, readyShare } = this.props;
    let shareModalStep;
    if (candidateShare) {
      if (withOpinions) {
        shareModalStep = 'candidateShareOptionsAllOpinions';
        AnalyticsActions.saveActionShareCandidateAllOpinions(VoterStore.electionId());
      } else {
        shareModalStep = 'candidateShareOptions';
        AnalyticsActions.saveActionShareCandidate(VoterStore.electionId());
      }
    } else if (measureShare) {
      if (withOpinions) {
        shareModalStep = 'measureShareOptionsAllOpinions';
        AnalyticsActions.saveActionShareMeasureAllOpinions(VoterStore.electionId());
      } else {
        shareModalStep = 'measureShareOptions';
        AnalyticsActions.saveActionShareMeasure(VoterStore.electionId());
      }
    } else if (officeShare) {
      if (withOpinions) {
        shareModalStep = 'officeShareOptionsAllOpinions';
        AnalyticsActions.saveActionShareOfficeAllOpinions(VoterStore.electionId());
      } else {
        shareModalStep = 'officeShareOptions';
        AnalyticsActions.saveActionShareOffice(VoterStore.electionId());
      }
    } else if (organizationShare) {
      if (withOpinions) {
        shareModalStep = 'organizationShareOptionsAllOpinions';
        AnalyticsActions.saveActionShareOrganizationAllOpinions(VoterStore.electionId());
      } else {
        shareModalStep = 'organizationShareOptions';
        AnalyticsActions.saveActionShareOrganization(VoterStore.electionId());
      }
    } else if (readyShare) {
      if (withOpinions) {
        shareModalStep = 'readyShareOptionsAllOpinions';
        AnalyticsActions.saveActionShareReadyAllOpinions(VoterStore.electionId());
      } else {
        shareModalStep = 'readyShareOptions';
        AnalyticsActions.saveActionShareReady(VoterStore.electionId());
      }
      // Default to ballot
    } else if (withOpinions) {
      shareModalStep = 'ballotShareOptionsAllOpinions';
      AnalyticsActions.saveActionShareBallotAllOpinions(VoterStore.electionId());
    } else {
      shareModalStep = 'ballotShareOptions';
      AnalyticsActions.saveActionShareBallot(VoterStore.electionId());
    }

    AppActions.setShowShareModal(true);
    AppActions.setShareModalStep(shareModalStep);
    const { pathname } = window.location;
    if (!stringContains('/modal/share', pathname) && isWebApp()) {
      const pathnameWithModalShare = `${pathname}${pathname.endsWith('/') ? '' : '/'}modal/share`;
      // console.log('Navigation ShareButtonDesktopTablet openShareModal ', pathnameWithModalShare)
      historyPush(pathnameWithModalShare);
    }
    this.setState({ openShareMenu: false });
  }

  render () {
    renderLog('ShareButtonDesktopTablet');  // Set LOG_RENDER_EVENTS to log all renders
    const {
      candidateShare, classes, measureShare, officeShare,
      organizationShare, readyShare, shareButtonText,
    } = this.props;
    const { anchorEl, chosenPreventSharingOpinions, openShareMenu } = this.state;

    let shareButtonClasses;
    let shareMenuItemsDescription;
    let shareMenuTextDefault;
    let shareMenuTextAllOpinions;
    if (candidateShare) {
      shareButtonClasses = classes.buttonCandidate;
      shareMenuItemsDescription = 'The first \'Candidate\' option below will generate a link to this Candidate\'s page. The second option also gives the viewer permission to see all of your opinions for this election (public and friends-only). On the next screen you\'ll have a chance to preview what a person sees when they click the link.';
      shareMenuTextDefault = 'Candidate';
      shareMenuTextAllOpinions = 'Candidate + Your Opinions';
    } else if (measureShare) {
      shareButtonClasses = classes.buttonCandidate;
      shareMenuItemsDescription = 'The first \'Measure\' option below will generate a link to this Measure page. The second option also gives the viewer permission to see all of your opinions for this election (public and friends-only). On the next screen you\'ll have a chance to preview what a person sees when they click the link.';
      shareMenuTextDefault = 'Measure';
      shareMenuTextAllOpinions = 'Measure + Your Opinions';
    } else if (officeShare) {
      shareButtonClasses = classes.buttonCandidate;
      shareMenuItemsDescription = 'The first \'Office\' option below will generate a link to this Office page. The second option also gives the viewer permission to see all of your opinions for this election (public and friends-only). On the next screen you\'ll have a chance to preview what a person sees when they click the link.';
      shareMenuTextDefault = 'Office';
      shareMenuTextAllOpinions = 'Office + Your Opinions';
    } else if (organizationShare) {
      shareButtonClasses = classes.buttonCandidate;
      shareMenuItemsDescription = 'The first \'This Page\' option below will generate a link to this page. The second option also gives the viewer permission to see all of your opinions for this election (public and friends-only). On the next screen you\'ll have a chance to preview what a person sees when they click the link.';
      shareMenuTextDefault = 'This Page';
      shareMenuTextAllOpinions = 'This Page + Your Opinions';
    } else if (readyShare) {
      shareButtonClasses = classes.buttonDefault;
      shareMenuItemsDescription = 'The first \'Ready\' Page option below will generate a link to their own Ready page without showing your opinions. The second option gives them permission to see all of your opinions for this election (public and friends-only). On the next screen you\'ll have a chance to preview what a person sees when they click the link.';
      shareMenuTextDefault = 'Ready Page';
      shareMenuTextAllOpinions = 'Ready Page + Your Opinions';
    } else {
      // Default to ballot
      shareButtonClasses = classes.buttonDefault;
      shareMenuItemsDescription = 'The first \'Ballot\' option below will generate a link to the ballot page without showing your opinions. The second option gives them permission to see all of your opinions for this election (public and friends-only). On the next screen you\'ll have a chance to preview what a person sees when they click the link.';
      shareMenuTextDefault = 'Ballot';
      shareMenuTextAllOpinions = 'Ballot + Your Opinions';
    }
    // Temporary override
    shareMenuItemsDescription = 'You\'ll have a chance to preview.';
    return (
      <>
        <Button
          aria-controls="shareMenuDesktopTablet"
          aria-haspopup="true"
          classes={{ root: shareButtonClasses }}
          color="primary"
          id="shareButtonDesktopTablet"
          onClick={this.handleShareButtonClick}
          variant="contained"
        >
          <Icon>
            <Reply
              classes={{ root: classes.shareIcon }}
            />
          </Icon>
          {shareButtonText || 'Share Page'}
        </Button>
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          className="u-z-index-5020"
          classes={{ paper: classes.paper }}
          id="shareMenuDesktopTablet"
          elevation={2}
          getContentAnchorEl={null}
          onClose={this.handleCloseMenu}
          open={openShareMenu}
          transformOrigin={{
            horizontal: 'right',
            vertical: 'top',
          }}
        >
          <MenuArrow />
          <MenuItem className={classes.menuItem}>
            <MenuItemDescriptionText>
              <Info classes={{ root: classes.informationIcon }} />
              {shareMenuItemsDescription}
            </MenuItemDescriptionText>
          </MenuItem>
          <MenuItem className={classes.menuItem} onClick={() => this.openShareModal()}>
            <MenuFlex>
              <MenuIcon>
                <i className="fas fa-list" />
              </MenuIcon>
              <MenuText>
                {shareMenuTextDefault}
              </MenuText>
              {/* <MenuInfo> - TURNED OFF BECAUSE OF TOOLTIP Z-INDEX PROBLEM */}
              {/*  <Tooltip */}
              {/*    arrow */}
              {/*    // classes={{ root: classes.toolTip }} */}
              {/*    // className="u-z-index-5030" */}
              {/*    enterDelay={300} */}
              {/*    // style={{ zIndex: '20000 !important' }} */}
              {/*    title="Share a link to this election so that your friends can get ready to vote. Your opinions are not included." */}
              {/*  > */}
              {/*    <i className="fas fa-info-circle" /> */}
              {/*  </Tooltip> */}
              {/* </MenuInfo> */}
            </MenuFlex>
          </MenuItem>
          <MenuSeparator />
          {chosenPreventSharingOpinions ? null : (
            <MenuItem className={classes.menuItem} onClick={() => this.openShareModal(true)}>
              <MenuFlex>
                <MenuIcon>
                  <Comment />
                </MenuIcon>
                <MenuText>
                  {shareMenuTextAllOpinions}
                </MenuText>
                {/* <MenuInfo> - TURNED OFF BECAUSE OF TOOLTIP Z-INDEX PROBLEM */}
                {/*  <Tooltip title="Share a link to the choices you've made for this election so that your friends can get ready to vote. This includes your public and friend's-only opinions." arrow enterDelay={300}> */}
                {/*    <i className="fas fa-info-circle" /> */}
                {/*  </Tooltip> */}
                {/* </MenuInfo> */}
              </MenuFlex>
            </MenuItem>
          )}
        </Menu>
      </>
    );
  }
}

const styles = () => ({
  paper: {
    borderRadius: '2px !important',
    marginTop: '10px !important',
    overflowX: 'visible !important',
    overflowY: 'visible !important',
  },
  buttonDefault: {
    padding: '2px 12px',
  },
  buttonCandidate: {
    padding: '2px 12px',
    width: 160,
  },
  informationIcon: {
    color: '#999',
    width: 16,
    height: 16,
    marginTop: '-3px',
    marginRight: 3,
  },
  menuItem: {
    zIndex: '9 !important',
    padding: '0 !important',
    marginBottom: '-2px !important',
    overflowWrap: 'break-word',
    paddingBottom: '1px !important',
    '&:last-child': {
      paddingBottom: '0 !important',
      paddingTop: '1px !important',
    },
    '&:hover': {
      background: '#efefef',
    },
  },
  shareIcon: {
    transform: 'scaleX(-1)',
    position: 'relative',
    top: -1,
  },
  toolTip: {
    zIndex: '5030 !important',
  },
});

const Icon = styled.span`
  margin-right: 4px;
`;

const MenuFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  padding: 10px 8px 10px 18px;
`;

const MenuIcon = styled.div`
  width: 20px !important;
  height: 20px !important;
  top: -2px;
  position: relative;
  & * {
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    min-height: 20px !important;
  }
  & svg {
    position: relative;
    left: -2px;
  }
`;

const MenuItemDescriptionText = styled.div`
  color: #999;
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 5px;
`;

const MenuText = styled.div`
  margin-left: 12px;
  margin-right: 12px;
`;

// const MenuInfo = styled.div`
//   margin-left: auto;
//   margin-top: 1px;
//   padding-left: 10px;
//   // z-index: 5030 !important;
// `;

const MenuSeparator = styled.div`
  height: 2px;
  background: #efefef;
  width: 80%;
  margin: 0 auto;
  position: absolute;
  left: 10%;
  z-index: 0 !important;
`;

const MenuArrow = styled.div`
  width: 12px;
  height: 12px;
  transform: rotate(45deg);
  background: white;
  position: absolute;
  top: -7px;
  left: calc(75%);
  border-top: 1px solid #e7e7e7;
  border-left: 1px solid #e7e7e7;
`;

export default withStyles(styles)(ShareButtonDesktopTablet);
