import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`;

const Item = styled.span`
  font-size: 0.84rem;
  font-weight: 700;
  color: #7a5c42;
  cursor: pointer;
  transition: color 0.15s;

  &:hover {
    color: #e0c498;
  }

  a {
    color: #7a5c42;
    text-decoration: none;
  }
`;

const ItemLast = styled(Item)`
  color: #d9a85a;
  cursor: default;
`;

const Separator = styled.span`
  font-size: 0.78rem;
  color: #533d2c;
  padding: 0 2px;
  padding-left: 5px;
`;

type Crumb = {
  title: string;
  path?: string;
};

function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <Nav>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.title}>
            {isLast || !item.path ? (
              <ItemLast>{item.title}</ItemLast>
            ) : (
              <Item>
                <Link to={item.path}>{item.title}</Link>
              </Item>
            )}

            {!isLast && <Separator>›</Separator>}
          </span>
        );
      })}
    </Nav>
  );
}

export default Breadcrumb;
