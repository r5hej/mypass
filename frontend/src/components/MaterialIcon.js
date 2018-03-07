export default function MaterialIcon({ icon, title, click, className }) {
	return (
		<i class={`material-icons ${className}`} title={title} onClick={click}>{icon}</i>
	);
}