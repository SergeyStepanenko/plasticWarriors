const reducer = (state = '', action) => {
	switch (action.type) {
	case 'DRAG_START':
		return state = {
			...state,
			onDrag: true,
			activeFigure: action.payload,
		};
	default:
		return state;
	}
};

export default reducer;
