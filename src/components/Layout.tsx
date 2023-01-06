import React, { ReactNode } from 'react'
import { Navbar } from './Navbar';
import Wrapper, { WrapperVariant } from './Wrapper';

interface LayoutProps {
    variant?: WrapperVariant,
    children: ReactNode,
}

const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
    return (
        <>
            <Navbar />
            <Wrapper variant={variant}>
                {children}
            </Wrapper>
        </>
    );
}

export default Layout;