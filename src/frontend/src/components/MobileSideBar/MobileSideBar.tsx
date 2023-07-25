import { useMobileSideBar } from "./use-mobile-sidebar";
import { block } from "million/react";
import { ViewModel } from "src/shared/types/viewmodel";
import { router } from "../../routing/router";
import { LoginPresenter } from "../../auth/login.presenter";
import { CollectionsBlock } from "../CollectionsBlock";

interface MenuIconProps {
	open: boolean;
}

const MenuIcon = ({ open }: MenuIconProps) => {
	return <span className="relative bottom-[1px]">{open ? "x" : "="}</span>;
};

interface MobileSideBarProps {
	viewModel: ViewModel;
}

const MobileSideBar = block((props: MobileSideBarProps) => {
	const { viewModel } = props;

	const loginPresenter = new LoginPresenter();

	const [showMenu, setMenuState] = useMobileSideBar(false);
	const backdropClassName = [
		"cursor-default transition fixed inset-0 bg-slate-100 transition-all ease-in-out delay-150",
		showMenu ? "visible opacity-75" : "invisible opacity-0",
	]
		.filter(Boolean)
		.join(" ");

	const menuContainerClassName = [
		"h-auto px-4 pt-0.25 sm:pt-1 pb-16 mx-auto relative bottom-2 transition-all ease-in-out delay-50 rounded-lg bg-slate-700",
		showMenu ? "max-h-[600px] w-full sm:w-3/4" : "max-h-[0px] w-2/3 sm:w-1/2",
	]
		.filter(Boolean)
		.join(" ");

	const listContainerClassName = [
		"pb-4 mb-3 text-white border-b-2 border-slate-600",
		showMenu ? "visible relative delay-[150ms]" : "invisible absolute",
	]
		.filter(Boolean)
		.join(" ");

	const logoutBtnClassName = [
		"bg-blue-100 h-full rounded-lg transition-all",
		showMenu ? "visible delay-[150ms] px-2 text-normal" : "invisible px-0 text-[0px]",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal={showMenu}
			className="lg:invisible lg:opacity-0"
		>
			<button
				className={backdropClassName}
				onClick={() => {
					setMenuState(false);
				}}
			/>
			<aside className="fixed inset-x-0 z-10 max-w-lg p-3 mx-auto text-black bottom-2">
				<div className={menuContainerClassName}>
					<div className={listContainerClassName}>
						<nav className="px-6 py-3">
							<button
								className="block mb-2 text-lg font-medium"
								onClick={() => {
									router.navigate({
										to: "/app",
									});
									setMenuState(false);
								}}
							>
								Dashboard
							</button>
							<h2 className="text-lg font-medium">Collections</h2>
							<ul className="mb-2 overflow-auto max-h-[20rem]">
								<CollectionsBlock
									collections={viewModel.collections}
									setState={setMenuState}
								/>
							</ul>
							<button
								className="block mb-2 text-lg font-medium"
								onClick={() => {
									router.navigate({
										to: "/app/plugins",
									});

									setMenuState(false);
								}}
							>
								Plugins
							</button>
						</nav>
					</div>
				</div>
			</aside>
			<div className="fixed inset-x-0 z-20 flex p-3 text-black bottom-6">
				<div className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg border-1 bg-slate-800">
					<h1 className="font-medium text-white">🐼 System Panda</h1>
					<button
						className="px-3 py-1 mx-auto bg-blue-200 rounded-lg"
						onClick={() => {
							setMenuState(!showMenu);
						}}
					>
						<MenuIcon open={showMenu} />
					</button>
					<button
						className={logoutBtnClassName}
						onClick={() => {
							loginPresenter.logout();
						}}
					>
						<span style={{ filter: "grayscale(100%)" }}>🚪</span>
					</button>
				</div>
			</div>
		</div>
	);
});

export default MobileSideBar;
