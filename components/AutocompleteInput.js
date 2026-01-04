'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function AutocompleteInput({
    value,
    onChange,
    suggestions = [],
    placeholder = '',
    name = '',
    required = false,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [filteredSuggestions, setFilteredSuggestions] = useState([])
    const wrapperRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (value) {
            const filtered = suggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(value.toLowerCase())
            )
            setFilteredSuggestions(filtered)
        } else {
            setFilteredSuggestions(suggestions)
        }
    }, [value, suggestions])

    const handleInputChange = (e) => {
        const newValue = e.target.value
        onChange(newValue)
        setIsOpen(true)
    }

    const handleSuggestionClick = (suggestion) => {
        onChange(suggestion)
        setIsOpen(false)
    }

    const handleInputFocus = () => {
        setIsOpen(true)
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    required={required}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rd-blue ${className}`}
                    autoComplete="off"
                />
                <ChevronDown
                    className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </div>

            {isOpen && filteredSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                            <span className="text-gray-900">{suggestion}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
