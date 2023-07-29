import {MouseEvent, ReactNode} from 'react';
import styled from 'styled-components';

const ModalDiv = styled.div<{open: boolean}> `
	display: ${(props) => props.open ? 'block' : 'none'};
	position: fixed;
	z-index: 1;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: auto;
	background-color: rgba(0,0,0,0.4);
`;

const ModalBox = styled.div `
	background-color: white;
	margin: 15% auto;
	border: 1px solid #888;
	width: 80%;
`;

const ModalTitle = styled.div `
	width: 100%;
	padding: 1rem;
	background-color: #ddd;
	text-align: center;
	font-weight: bold;
`;

const ModalContent = styled.div `
	padding: 1rem;
`;

interface ModalAttrs {
	open: boolean;
	title: string;
	children: ReactNode;
	onClose?: ()=>void;
};

const Modal = (props: ModalAttrs) => {
	const {open, onClose, title, children} = props;
	function onClick(event: MouseEvent) {
		const target: HTMLDivElement = event.currentTarget as HTMLDivElement;
		console.log({id: target.id});
		if (target.id !== "modal-content-div") {
			onClose && onClose();
		}
	}

	return (
		<ModalDiv open={open} onClick={onClick}>
			<ModalBox id="modal-content-div">
				{title && <ModalTitle>{title}</ModalTitle>}
				<ModalContent>
				{children}
				</ModalContent>
			</ModalBox>
		</ModalDiv>
	);
}

export default Modal;


