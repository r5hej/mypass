export default function MaterialButton({ icon, title, click, align, disabled }) {
	let al = align ? ` ${align}-align` : '';
	return (
		<button class={`no-select material-icons material-button${al}`} title={title} onClick={click} disabled={disabled}>{icon}</button>
	);
}