import { gql } from 'apollo-boost';

export const GameMngGameListing = (variables) => ({
    query: gql`
            query GameMngGameListing($filterInput:GameMngGameFilterInput ,$paginationInput:GameMngGamePaginationInput,$sortInput:GameMngGameSortInput){
                GameMngGameListing(filterInput:$filterInput,paginationInput:$paginationInput,sortInput:$sortInput){
                    listing{
                       id,name,active,
                    },
                    queryTotalResultCount
                }
            }`,
    variables,
    fetchPolicy: 'network-only',
})

export const GameMngGame = (variables) => ({
    query: gql`
            query GameMngGame($id: ID!, $organizationId: String!){
                GameMngGame(id:$id, organizationId:$organizationId){
                    id,name,description,active,organizationId,
                    metadata{ createdBy, createdAt, updatedBy, updatedAt }
                }
            }`,
    variables,
    fetchPolicy: 'network-only',
})


export const GameMngCreateGame = (variables) => ({
    mutation: gql`
            mutation  GameMngCreateGame($input: GameMngGameInput!){
                GameMngCreateGame(input: $input){
                    id,name,description,active,organizationId,
                    metadata{ createdBy, createdAt, updatedBy, updatedAt }
                }
            }`,
    variables
})

export const GameMngDeleteGame = (variables) => ({
    mutation: gql`
            mutation GameMngGameListing($ids: [ID]!){
                GameMngDeleteGames(ids: $ids){
                    code,message
                }
            }`,
    variables
})

export const GameMngUpdateGame = (variables) => ({
    mutation: gql`
            ,mutation  GameMngUpdateGame($id: ID!,$input: GameMngGameInput!, $merge: Boolean!){
                GameMngUpdateGame(id:$id, input: $input, merge:$merge ){
                    id,organizationId,name,description,active
                }
            }`,
    variables
})

export const onGameMngGameModified = (variables) => ([
    gql`subscription onGameMngGameModified($id:ID!){
            GameMngGameModified(id:$id){    
                id,organizationId,name,description,active,
                metadata{ createdBy, createdAt, updatedBy, updatedAt }
            }
    }`,
    { variables }
])