
import React, { useContext } from 'react';
import { TextField, FormControlLabel, Switch } from '@material-ui/core';
import GameDetail from './GameDetail'
import * as Yup from "yup";
import _ from '@lodash';
import GameContext from '../GameContext';


export function basicInfoFormValidationsGenerator(T) {
    return {
        name: Yup.string()
            .min(3, T.translate("game.form_validations.name.length", {len:3}))
            .required(T.translate("game.form_validations.name.required"))
            .test(
                'is-hex',
                T.translate("game.form_validations.name.hex_required"),
                function (value) {
                    if (value && value.length > 10) {
                        return /^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0;
                    }
                    return true;
                }
            )
    };
}


/**
 * Aggregate BasicInfo form
 * @param {{dataSource,T}} props 
 */
/**
 * Aggregate BasicInfo form
 */
export function BasicInfo() {
    const { form, T, onChange, errors, touched, canWrite, readGameDetailsResult } = useContext(GameContext);
    return (

        <div>
            <TextField
                className="mt-8 mb-16"
                helperText={(errors.name && touched.name) && errors.name}
                error={errors.name && touched.name}
                required
                label={T.translate("game.name")}
                autoFocus
                id="name"
                name="name"
                value={form.name}
                onChange={onChange("name")}
                onBlur={onChange("name")}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: !canWrite(),
                }}
            />

            <TextField
                className="mt-8 mb-16"
                helperText={(errors.description && touched.description) && errors.description}
                error={errors.description && touched.description}
                id="description"
                name="description"
                onChange={onChange("description")}
                onBlur={onChange("description")}
                label={T.translate("game.description")}
                type="text"
                value={form.description}
                multiline
                rows={5}
                variant="outlined"
                fullWidth
                InputProps={{
                    readOnly: !canWrite(),
                }}
            />

            <FormControlLabel
                control={
                    <Switch
                        checked={form.active}
                        onChange={onChange("active")}
                        id="active"
                        name="active"
                        value={form.active}
                        inputProps={{ 'aria-label': 'primary checkbox' }}
                        variant="outlined"
                        disabled={!canWrite()}
                    />
                }
                label={T.translate("game.active")}
            />

            {readGameDetailsResult.called && <GameDetail />}
        </div>
    );
}

