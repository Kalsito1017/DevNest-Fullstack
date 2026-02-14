import { useState } from 'react';

export default function PasswordInput({
    value,
    onChange,
    placeholder,
    id,
    label,
    showStrength = false,
    disabled = false
}) {
    const [showPassword, setShowPassword] = useState(true); // Always visible by default
    const [isFocused, setIsFocused] = useState(false);

    const calculatePasswordStrength = (password) => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        return strength;
    };

    const strength = calculatePasswordStrength(value);
    const getStrengthColor = () => {
        if (strength < 33) return '#ff6b6b';
        if (strength < 66.7) return '#ffa726';
        if (strength < 100) return '#ffee58';
        return '#4caf50';
    };

    const getStrengthText = () => {
        if (strength < 33) return 'Weak';
        if (strength < 66.7) return 'Medium';
        if (strength < 100) return 'Strong';
        return 'Excellent';
    };

    return (
        <div className="password-input-group">
            {label && <label htmlFor={id}>{label}</label>}
            <div className={`password-input-wrapper ${isFocused ? 'focused' : ''}`}>
                <input
                    type={showPassword ? 'text' : 'password'}
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="password-input"
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={disabled}
                >
                   
                </button>
            </div>

            {showStrength && value && (
                <div className="password-strength">
                    <div className="strength-bar">
                        <div
                            className="strength-fill"
                            style={{
                                width: `${strength}%`,
                                backgroundColor: getStrengthColor()
                            }}
                        />
                    </div>
                    <span className="strength-text">
                        Strength: <strong style={{ color: getStrengthColor() }}>
                            {getStrengthText()}
                        </strong>
                    </span>
                </div>
            )}

            {!showStrength && (
                <small className="password-hint">Minimum 6 characters</small>
            )}
        </div>
    );
}