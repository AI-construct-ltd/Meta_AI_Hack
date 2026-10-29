import Logo from "./Logo";
import NavLinks from "./NavLinks";
import UserMenu from "./auth/UserMenu";

export default function SiteHeader() {
  return (
    <header className="site-head">
      <div className="head-left">
        <Logo />
        <span className="apprentice-tag">Apprentice Training</span>
        <NavLinks />
      </div>
      <div className="head-right">
        <UserMenu />
      </div>
    </header>
  );
}
