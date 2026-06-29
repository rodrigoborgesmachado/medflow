type Props = {
    title: string;
    children: React.ReactNode;
};

export default function PageContainer({ title, children }: Props) {
    return (
        <div className="page-container">
            <div className="page-content">
                <h1>{title}</h1>

                {children}
            </div>
        </div>
    );
}