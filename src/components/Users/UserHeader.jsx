import { Button } from 'react-bootstrap';
import HeaderActions from '../Shared/HeaderActions';

const UsersHeader = ({ onInviteClick }) => {
    return (
        <HeaderActions>
            <Button
                variant="primary"
                className="px-4 fw-semibold"
                onClick={onInviteClick}
            >
                <i className="bi bi-envelope-plus me-0"></i>
            </Button>
        </HeaderActions>
    );
};

export default UsersHeader;