import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
  FileExcelOutlined,
  TableOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar, Flex, Divider, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const username = sessionStorage.getItem("username");
  const handleLogOut = () => {
    //Reset
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('admin');
    window.location = '/';
  }
  return (
<<<<<<< HEAD
    <Layout className="app-layout" style={{ minHeight: '100vh' }}>

      <Sider 
        className="app-sider"
        trigger={null}
=======
    <Layout style={{ minHeight: '97vh' }}>

      <Sider trigger={null}
>>>>>>> d345abb (init frontend)
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
<<<<<<< HEAD
        onBreakpoint={(broken) => setCollapsed(broken)}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
        }}
      >
=======
        onBreakpoint={(broken) => setCollapsed(broken)}>
>>>>>>> d345abb (init frontend)
        <div
          style={{
            color: 'white',
            padding: '1.5rem',
            fontWeight: 'bold',
            fontSize: collapsed ? '0' : '16px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'start',
            gap: '10px',
          }}
        >
          <Avatar style={{ backgroundColor: '#1677FF' }} icon={<UserOutlined />} />
          {!collapsed && <Typography.Text style={{ color: 'white' }} strong>{username}</Typography.Text>}
        </div>
        <div className="demo-logo-vertical" />
        <Divider type='horizontal' style={{ margin: '0 0 2rem 0', height: '1px', backgroundColor: 'white' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          onClick={({ key }) => navigate(key)}
          items={[
            {
                key: '/sheet',
                icon: <FileExcelOutlined />,
<<<<<<< HEAD
                label: 'Nodes',
=======
                label: 'Node',
>>>>>>> d345abb (init frontend)
              },
            {
              key: '/database',
              icon: <UnorderedListOutlined />,
              label: 'Database',
            },
            {
                key: '/schema',
                icon: <TableOutlined />,
                label: 'Schema',
              },
            {
              key: '/user',
              icon: <UserOutlined />,
              label: 'User',
            }
          ]}
        />
      </Sider>

<<<<<<< HEAD
      <Layout style={{ 
        width: '100%',
        marginLeft: collapsed ? '80px' : '200px',
        transition: 'margin-left 0.2s'
      }}>
        <Header 
          className="app-header"
          style={{ 
            padding: 0, 
            background: colorBgContainer, 
            display: 'flex', 
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            right: 0,
            left: collapsed ? '80px' : '200px',
            zIndex: 999,
            transition: 'left 0.2s'
          }}
        >
=======
      <Layout style={{ width: '100%' }}>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between' }}>
>>>>>>> d345abb (init frontend)
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Flex gap='small' align='center'>
            <Divider type='vertical' style={{ height: '40px' }} />
            <Button onClick={handleLogOut} danger type='primary' shape='circle' icon={<LogoutOutlined />} />
          </Flex>
        </Header>

        <Content
<<<<<<< HEAD
          className={`app-content ${collapsed ? 'collapsed' : ''}`}
          style={{
            margin: '88px 16px 24px 16px',
            padding: 24,
            minHeight: 'calc(100vh - 112px)',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            transition: 'margin-left 0.2s'
=======
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
>>>>>>> d345abb (init frontend)
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
