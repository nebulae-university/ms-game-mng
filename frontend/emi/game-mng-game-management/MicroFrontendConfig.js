import React from 'react';
import { Redirect } from 'react-router-dom';
import i18n from './i18n'

const auth = ["GAME_READ"];

export const MicroFrontendConfig = {
    settings: {
        layout: {}
    },
    auth,
    routes: [
        { 
            path: '/game-mng/games/:gameId/:gameHandle?',
            component: React.lazy(() => import('./game/Game'))
        },
        {
            path: '/game-mng/games',
            component: React.lazy(() => import('./games/Games'))
        },
        {
            path: '/game-mng',
            component: () => <Redirect to="/game-mng/games" />
        }
    ],
    navigationConfig: [
        {
            'id': 'settings',
            'type': 'collapse',
            'icon': 'settings',
            'priority': 100,
            children: [{
                'id': 'game-mng-game-management',
                'type': 'item',
                'icon': 'business',
                'url': '/game-mng',
                'priority': 2000,
                auth
            }]
        }
    ],
    i18nLocales: i18n.locales
};

