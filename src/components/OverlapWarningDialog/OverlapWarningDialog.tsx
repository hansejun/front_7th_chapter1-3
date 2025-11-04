import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';

import { Event } from '../../types';

/**
 * Props for the OverlapWarningDialog component
 */
interface OverlapWarningDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback fired when the dialog should be closed */
  onClose: () => void;
  /** Callback fired when user confirms to proceed despite overlap */
  onConfirm: () => void;
  /** List of events that overlap with the current event */
  overlappingEvents: Event[];
}

/**
 * Dialog component that warns users about event time overlaps
 * Displays a list of conflicting events and asks for confirmation to proceed
 */
const OverlapWarningDialog = ({
  open,
  onClose,
  onConfirm,
  overlappingEvents,
}: OverlapWarningDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>일정 겹침 경고</DialogTitle>
      <DialogContent>
        <DialogContentText>다음 일정과 겹칩니다:</DialogContentText>
        {overlappingEvents.map((event) => (
          <Typography key={event.id} sx={{ ml: 1, mb: 1 }}>
            {event.title} ({event.date} {event.startTime}-{event.endTime})
          </Typography>
        ))}
        <DialogContentText>계속 진행하시겠습니까?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button color="error" onClick={onConfirm}>
          계속
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OverlapWarningDialog;
