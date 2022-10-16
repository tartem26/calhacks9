import * as React from 'react';
// import Data from '../data/diseases.json';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { csv } from "d3-fetch";
import styled from 'styled-components';

/* Map */
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

const colorScale = scaleQuantize()
.domain([1, 10])
.range([
  "#ebf9f7",
  "#d7f4ef",
  "#b0e8df",
  "#88ddcf",
  "#61d1be",
  "#4dcbb6",
  "#34b29d",
  "#288a7a",
  "#1d6357"
]);

/* Score (Current Situation) Calculation */
function scoreCurrent() {
  const diseasesLevel = require('../data/diseases.json');
  let actualDiseasesLevel = 0;
  let score = 0 ;

  for (let i = 0; i < 3219; i++) {
    actualDiseasesLevel += diseasesLevel[i].diseases_level;
  }

  score = actualDiseasesLevel / (20.6 * 3220) * 100;

  return Math.round(score);
}



/* Score (Prediction) Calculation */
function scorePrediction() {
  const diseasesLevelPrediction = require('../data/diseasesPrediction.json');
  let actualDiseasesLevelPrediction = 0;
  let scorePrediction = 0 ;

  for (let i = 0; i < 3219; i++) {
    actualDiseasesLevelPrediction += diseasesLevelPrediction[i].diseases_levelPrediction;
  }

  scorePrediction = actualDiseasesLevelPrediction / (20.6 * 3220) * 100;
  
  return Math.round(scorePrediction);
}

/* Prediction */
// const predict = data => {
//   const weights = [2.5, 0.01]
//   var prediction = 0

//   for (const [index, weight] of weights.entries()) {
//     const dataPoint = data[index]
//     prediction += dataPoint * weight
//   }

//   return prediction
// }

// const infectedPeople = [2, 5, 12, 30]
// const infectedCountries = [1, 1, 4, 5]
// const data = [infectedPeople[0], infectedCountries[0]]
// const prediction = predict(data)

/* Upper Menu */
const drawerWidth = 240;
// const navItems = ['Map', 'About', 'Contact'];
const navItems = ['Map'];

/* Buttons */
const ButtonToggle = styled(Button)`
  opacity: 0.6;
  ${({ active }) =>
    active &&
    `
    opacity: 1;
  `}
`;

const types = ['Current situation', 'Prediction'];

/* Main Function */
function Map(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MappedOut
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  const [data, setData] = useState([]);

  useEffect(() => {
    csv("./diseases.csv").then(counties => {
      setData(counties);
    });
  }, []);

  const [active, setActive] = useState(types[0]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}
          >
            MappedOut
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }}>
                {item}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" width="100%" height="100%" sx={{ p: 1 }}>
        <Toolbar />
        <Grid container spacing={2} columns={12}>
          <Grid item xs={6.5}>
            <ComposableMap projection="geoAlbersUsa">
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const cur = data.find(s => s.id === geo.id);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={colorScale(cur ? cur.diseases_level : "#EEE")}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </Grid>
          <Grid item xs={5.5}>
            <Toolbar />
            {types.map(type => (
              <ButtonToggle
                style={{ fontSize: 17, margin: 40 }}
                key={type}
                active={active === type}
                onClick={() => setActive(type)}
              >
                {type}
              </ButtonToggle>
            ))}
            <Typography
              variant="h5"
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, textAlign: 'center' }}
            >
              Score
            </Typography>
            <Typography
              variant="h5"
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, textAlign: 'center' }}
            >
              {scoreCurrent()}%
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

Map.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Map;
