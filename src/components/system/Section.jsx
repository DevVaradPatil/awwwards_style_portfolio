import Container from './Container.jsx'

export default function Section({
  id,
  as: Tag = 'section',
  className = '',
  containerClassName = '',
  bare = false,
  children,
  ...rest
}) {
  return (
    <Tag
      id={id}
      className={`relative w-full py-16 md:py-24 lg:py-32 ${className}`}
      {...rest}
    >
      {bare ? children : <Container className={containerClassName}>{children}</Container>}
    </Tag>
  )
}
