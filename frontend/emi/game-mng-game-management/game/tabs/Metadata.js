
import React, { useContext } from 'react';
import { TextField } from '@material-ui/core';
import GameContext from '../GameContext';
import GameCard from './GameCard';



/**
 * Aggregate Metadata read-only form
 */
function Metadata() {
    // parent date
    const { form, T } = useContext(GameContext);
    //Responsive styles
    const fullHalfStyle = "w-full p-2 sm:w-1/2";

    return (
        <div>
            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("game.metadata.createdBy")}
                id="createdBy"
                name="createdBy"
                value={!form.metadata ? "" : form.metadata.createdBy}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />

            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("game.metadata.createdAt")}
                id="createdAt"
                name="createdAt"
                value={!form.metadata ? "" : new Date(form.metadata.createdAt).toLocaleString()}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />

            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("game.metadata.updatedBy")}
                id="updatedBy"
                name="updatedBy"
                value={!form.metadata ? "" : form.metadata.updatedBy}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />


            <TextField
                className={`mt-8 mb-16 ${fullHalfStyle}`}
                label={T.translate("game.metadata.updatedAt")}
                id="updatedAt"
                name="updatedAt"
                value={!form.metadata ? "" : new Date(form.metadata.updatedAt).toLocaleString()}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: true,
                }}
            />

            <GameCard />

        </div>
    );
}

export default Metadata;

