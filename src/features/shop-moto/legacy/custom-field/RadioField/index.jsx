import React from 'react';
import PropTypes from 'prop-types';

RadioField.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    type: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

RadioField.defaultProps = {
    title: "",
    label: "",
    type: "radio",
    className: "",
};

function RadioField(props) {
    const {
        id,
        title,
        name,
        type,
        className,
        defaultChecked,
        onChange
    } = props;

    return (
        <>
            <input
                id={id}
                name={name}
                type={type}
                className={className}
                onChange={onChange}
                defaultChecked={defaultChecked}
            />
            <label htmlFor={id}>{title}</label>
        </>
    );
}

export default RadioField;