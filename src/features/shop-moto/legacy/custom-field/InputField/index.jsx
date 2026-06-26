import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

InputField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    type: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    error: PropTypes.string
};

InputField.defaultProps = {
    label: "",
    type: "text",
    className: "",
    placeholder: "",
    required: false,
    disabled: false,
    error: ""
};

function InputField(props) {
    const {
        name,
        label,
        type,
        placeholder,
        className,
        required,
        defaultValue,
        disabled,
        onChange,
        min,
        max,
        error
    } = props;
    const [state, setState] = useState(defaultValue ? defaultValue : '')
    useEffect(() => {
        const val = defaultValue ? defaultValue : ''
        setState(val)
    }, [defaultValue])
    
    function handleChange(event) {
        onChange(event)
        setState(event.target.value);
    }

    return (
        <div className="input-field">
            {label && <label htmlFor={name}>
                {label} 
                {required && <span className="text-rose-500 text-lg pl-1">*</span>}
            </label>}
            <input
                className={className}
                type={type}
                id={name}
                min={min}
                max={max}
                required={required}
                placeholder={placeholder}
                disabled={disabled}
                value={state}
                onChange={(e) => handleChange(e)}
            />
            {error && <div className="error">{ error }</div>}
        </div>
    );
}

export default InputField;