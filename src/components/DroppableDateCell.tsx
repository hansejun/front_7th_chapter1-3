import { useDroppable } from '@dnd-kit/core';
import { Box } from '@mui/material';
import React from 'react';

interface DroppableDateCellProps {
  dateString: string;
  children: React.ReactNode;
  onCellClick?: (dateString: string) => void;
}

export const DroppableDateCell = ({
  dateString,
  children,
  onCellClick,
}: DroppableDateCellProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: dateString,
    disabled: !dateString,
  });

  const handleClick = () => {
    if (dateString && onCellClick) {
      onCellClick(dateString);
    }
  };

  return (
    <Box
      ref={setNodeRef}
      onClick={handleClick}
      sx={{
        height: '100%',
        width: '100%',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isOver ? '#e3f2fd' : 'transparent',
        cursor: dateString ? 'pointer' : 'default',
      }}
    >
      {children}
    </Box>
  );
};
