export default function MaterialButton({ icon, title, click, align }) {
	let al = align ? ` ${align}-align` : '';
	return (
		<button class={`material-icons material-button${al}`} title={title} onClick={click}>{icon}</button>
	);
}