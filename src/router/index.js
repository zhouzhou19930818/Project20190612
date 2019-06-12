import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';


const SubRoutes = (route) => (
    route.tag === 'Redirect' ?
        <Redirect from={ route.from } to={ route.to } exact={ route.exact }
                  render={ props => (<route.component { ...props } routes={ route.children }/>) }/> :
        <Route path={ route.path } exact={ route.exact }
               render={ props => (<route.component { ...props } routes={ route.children }/>) }/>
);
const Routes = (props) => (
    <Switch>{ props.routes.map((route, i) => <SubRoutes key={ i } { ...route } />) }</Switch>
);

const NestRouter = (props) => (
    <Switch>{ props.children.map((route, i) => <SubRoutes key={ i } { ...route } />) }</Switch>
);

export { Routes, NestRouter };
