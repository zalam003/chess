import { useEffect, useState, useCallback } from "react";
import { Layout } from "antd";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useLocation,
} from "react-router-dom";
import { useWindowSize } from "./hooks/useWindowSize";
import { ReactComponent as LogoImg } from "./assets/logoSvg.svg";

import { ELO_TOKEN_ADDRESS } from "./contracts/address";
import { eloAbi } from "./contracts/eloAbi";

import Account from "./components/Account";
import Chains from "./components/Chains";
import Stakes from "./components/Stakes";
import NFTBalance from "./components/NFTBalance";
import MenuItems from "./components/MenuItems";
import Lobby from "./components/Lobby";
import LiveChess from "./components/LiveChess/";

import "./styles/main.scss";
import "./style.css";
import "antd/dist/antd.css";
import { Button, notification } from "antd";

const { Header, Footer } = Layout;

// You'll need to implement these hooks to replace Moralis functionality
import { useAuth } from "./hooks/useAuth";
import { useWeb3 } from "./hooks/useWeb3";
import { useCloudFunction } from "./hooks/useCloudFunction";

const App = ({ isServerInfo }) => {
  const { isAuthenticated, user } = useAuth();
  const { isWeb3Enabled, enableWeb3 } = useWeb3();
  const { width } = useWindowSize();
  const [isPairing, setIsPairing] = useState(false);
  const [pairingParams, setPairingParams] = useState({});

  // Replace this with your own implementation to fetch ELO
  const { data: elo, fetchElo } = useWeb3();

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled) enableWeb3();
  }, [isAuthenticated, isWeb3Enabled]);

  useEffect(() => {
    if (user) fetchElo();
  }, [user, isWeb3Enabled]);

  return (
    <Layout style={{ height: "100vh", overflow: "auto" }}>
      <Router>
        {isPairing && <Redirect to="/live-chess" />}
        <ActiveChallengeNotification setIsPairing={setIsPairing} />
        {width > 860 ? (
          <Nav elo={elo} />
        ) : (
          <>
            <NavSmTop elo={elo} />
            <NavSmBtm />
          </>
        )}
        <div style={styles.content}>
          <Switch>
            <Route exact path="/lobby">
              <Lobby
                setIsPairing={setIsPairing}
                setPairingParams={setPairingParams}
                pairingParams={pairingParams}
                elo={elo}
              />
            </Route>
            <Route path="/stakes">
              <Stakes />
            </Route>
            <Route path="/nftBalance">
              <NFTBalance />
            </Route>
            <Route path="/live-chess">
              <LiveChess
                user={user}
                isPairing={isPairing}
                setIsPairing={setIsPairing}
                pairingParams={pairingParams}
                setPairingParams={setPairingParams}
              />
            </Route>
            <Route path="/">
              <Redirect to="/lobby" />
            </Route>
          </Switch>
        </div>
      </Router>
    </Layout>
  );
};

const ActiveChallengeNotification = ({ setIsPairing }) => {
  const location = useLocation();
  const openNotification = useCallback(() => {
    // ... (keep the existing notification logic)
  }, [setIsPairing]);

  // Replace this with your own implementation to fetch active challenges
  const { data: challenge, fetch } = useCloudFunction("joinExistingChallenge");

  useEffect(() => {
    // ... (keep the existing effect logic)
  }, [challenge, location, openNotification]);

  return <></>;
};

// ... (keep the existing Nav, NavSmTop, NavSmBtm components)

// ... (keep the existing styles object)

export const Logo = () => (
  // ... (keep the existing Logo component)
);

export default App;
