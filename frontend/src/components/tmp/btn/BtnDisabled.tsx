import type { PropsWithChildren } from 'react';
import BtnDefault from 'components/tmp/btn/BtnDefault';

type BtnDefaultProps = React.ComponentProps<typeof BtnDefault>;

function BtnDisabled({
  children,
  ...props
}: PropsWithChildren<BtnDefaultProps>) {
  return (
    <BtnDefault disabled {...props}>
      {children}
    </BtnDefault>
  );
}

export default BtnDisabled;
