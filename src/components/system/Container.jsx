export default function Container({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-14 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
