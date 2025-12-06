'use client';

import React from 'react';
import {
    Card,
    CardHeader,
    Button,
    TextContent,
    Callout,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell
} from '@crayonai/react-ui';

import { ComponentSpec } from '../../lib/types';

interface CrayonRendererProps {
    spec: ComponentSpec;
    className?: string;
    onAction?: (action: any) => void;
}

export function CrayonRenderer({ spec, className, onAction }: CrayonRendererProps) {
    // Simple mapping based on type
    if (spec.type === 'card') {
        return (
            <Card className={className}>
                {spec.props.title && <CardHeader title={spec.props.title} />}
                <div className="p-6">
                    {spec.props.content}
                </div>
                {spec.props.footer && <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">{spec.props.footer}</div>}
            </Card>
        );
    }

    if (spec.type === 'table') {
        return (
            <div className={className}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {spec.props.columns?.map((col: any) => (
                                <TableHead key={col.key}>{col.label}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {spec.props.data?.map((row: any, i: number) => (
                            <TableRow key={i}>
                                {spec.props.columns?.map((col: any) => (
                                    <TableCell key={col.key}>{row[col.key]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    // Fallback for other types or custom implementations
    return (
        <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
            <h3 className="font-bold text-sm mb-2">{spec.type} Component</h3>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                {JSON.stringify(spec, null, 2)}
            </pre>
        </div>
    );
}
