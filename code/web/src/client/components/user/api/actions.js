// Imports
import axios from 'axios'

// App Imports
import { routesApi } from '../../../setup/routes'
import { queryBuilder } from '../../../setup/helpers'

// Actions Types
export const LOGIN_REQUEST = 'AUTH/LOGIN_REQUEST'
export const LOGIN_RESPONSE = 'AUTH/LOGIN_RESPONSE'
export const SET_USER = 'AUTH/SET_USER'
export const LOGOUT = 'AUTH/LOGOUT'

// Actions

// Set a user after login or using localStorage token
export function setUser(token, user) {
    if(token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    return { type: SET_USER, user }
}

// Login a user using credentials
export function login(userCredentials) {
    return dispatch => {
        dispatch({
            type: LOGIN_REQUEST
        })

        return axios.post(routesApi, queryBuilder({ type: 'query', operation: 'userLogin', data: userCredentials, fields: ['user {name, email}', 'token'] }))
            .then(response => {
                let error = ''

                if(response.data.errors && response.data.errors.length > 0) {
                    error = response.data.errors[0].message
                } else if(response.data.data.userLogin.token !== '') {
                    const token = response.data.data.userLogin.token

                    dispatch(setUser(token, response.data.data.userLogin.user))
                }

                dispatch({
                    type: LOGIN_RESPONSE,
                    error
                })
            })
            .catch(error => {
                dispatch({
                    type: LOGIN_RESPONSE,
                    error: 'Please try again'
                })
            })
    }
}

// Register a user
export function register(userDetails) {
    return dispatch => {
        return axios.post(routesApi, queryBuilder({ type: 'mutation', operation: 'userSignup', data: userDetails, fields: ['id', 'name', 'email'] }))
    }
}

// Log out user and remove token from localStorage
export function logout() {
    return dispatch => {
        window.localStorage.removeItem('token')

        dispatch({
            type: LOGOUT
        })
    }
}