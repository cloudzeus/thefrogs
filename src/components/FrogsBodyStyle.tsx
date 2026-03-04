"use client";
import { useEffect } from 'react';

export default function FrogsBodyStyle() {
    useEffect(() => {
        document.body.style.backgroundColor = '#2A2D25';
        document.body.style.color = '#F9F6EF';
        return () => {
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        };
    }, []);
    return null;
}
