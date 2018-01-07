import * as types from '../constants/constants';

export function handleDragStart(e) {
	return ({
		type: types.DRAG_START,
		payload: e.target.id
	});
}

export function handleDragEnd() {
	return ({
		type: types.DRAG_END,
	});
}

export function handleUpdateCell({variant, id, activeFigure}) {
	if (variant === types.UPDATE_CELL_ADD) {
		return ({
			type: types.UPDATE_CELL_ADD,
			payload: {id: id, activeFigure: activeFigure}
		});
	}
	if (variant === types.UPDATE_CELL_REMOVE) {
		return ({
			type: types.UPDATE_CELL_REMOVE,
			payload: {id: id, activeFigure: activeFigure}
		});
	}
}

export function removeKing(activeFigure) {
	return ({
		type: types.REMOVE_KING,
		payload: activeFigure
	});
}

export function restoreKing(king) {
	return ({
		type: types.RESTORE_KING,
		payload: king
	});
}
